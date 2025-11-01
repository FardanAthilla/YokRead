import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../API/firebase";
import type { ComicDetail } from "../../types/types";

// =======================
// 🔹 Local Storage Helpers
// =======================
const LOCAL_KEY = "readHistory";

const getLocalHistory = (): Record<string, string[]> => {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? JSON.parse(data) : {};
};

const saveLocalHistory = (data: Record<string, string[]>) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
};

// =======================
// 🔹 Firebase Sync Helpers
// =======================
const syncLocalToFirebase = async (uid: string) => {
  const local = getLocalHistory();
  const ref = doc(db, "readHistory", uid);
  const snap = await getDoc(ref);

  let merged = local;
  if (snap.exists()) {
    const dbData = snap.data().data || {};
    merged = { ...dbData, ...local };

    for (const key in local) {
      if (dbData[key]) {
        merged[key] = Array.from(new Set([...dbData[key], ...local[key]]));
      }
    }
  }

  await setDoc(ref, { uid, data: merged });
  localStorage.removeItem(LOCAL_KEY);
  return merged;
};

// =======================
// 🔹 Main Hook (Logic)
// =======================
export const useDetailLogic = () => {
  const { param } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detailUrl = location.state as string | undefined;

  // === State
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chapter" | "similar">("chapter");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [readHistory, setReadHistory] = useState<Record<string, string[]>>({});
  const [showLogin, setShowLogin] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // ======================
  // 🔹 Fetch Detail Komik
  // ======================
  const fetchDetail = async (url?: string) => {
    setIsLoading(true);
    try {
      const proxyUrl =
        url
          ?.replace("https://weeb-scraper.onrender.com/api", "/api-komiku")
          ?.replace("http://weeb-scraper.onrender.com/api", "/api-komiku") ||
        `/api-komiku/komiku/${param}`;

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const json = await res.json();
      setComic(json.data as ComicDetail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ======================
  // 🔹 Auth State & Sync
  // ======================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const synced = await syncLocalToFirebase(u.uid);
        setReadHistory(synced);

        const favRef = doc(db, "favorites", u.uid);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()) {
          const favs = favSnap.data().items || [];
          setIsFavorite(favs.includes(param));
        }
      } else {
        setUser(null);
        setReadHistory(getLocalHistory());
      }
    });
    return () => unsub();
  }, [param]);

  // ======================
  // 🔹 Fetch Data Detail
  // ======================
  useEffect(() => {
    fetchDetail(detailUrl);
  }, [param, detailUrl]);

  // ======================
  // 🔹 Mark Chapter Read
  // ======================
  const markAsRead = async (chapterParam: string) => {
    if (!comic) return;
    const key = comic.param || param;
    if (!key) return;

    const fullParam = chapterParam.startsWith(key)
      ? chapterParam
      : `${key}-${chapterParam}`;

    const updated = { ...readHistory };
    const prev = updated[key] || [];
    const filtered = prev.filter((c) => c !== fullParam);
    updated[key] = [...filtered, fullParam];

    setReadHistory(updated);

    if (user) {
      await updateDoc(doc(db, "readHistory", user.uid), { data: updated });
    } else {
      saveLocalHistory(updated);
    }
  };

  // ======================
  // 🔹 Favorite Handling
  // ======================
  const toggleFavorite = async () => {
    if (!user) return setShowLogin(true);

    const ref = doc(db, "favorites", user.uid);
    const snap = await getDoc(ref);
    let items: string[] = snap.exists() ? snap.data().items || [] : [];

    if (isFavorite) {
      items = items.filter((p) => p !== param);
    } else {
      items.push(param!);
    }

    await setDoc(ref, { items }, { merge: true });
    setIsFavorite(!isFavorite);
  };

  // ======================
  // 🔹 Expose Logic
  // ======================
  return {
    // Data
    comic,
    error,
    isLoading,
    activeTab,
    isFavorite,
    showLogin,
    readHistory,
    user,

    // Actions
    setActiveTab,
    toggleFavorite,
    markAsRead,
    setShowLogin,
    navigate,
    param,
  };
};
