import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../API/firebase";
import type { ComicChapter } from "../../types/types";

interface LocationState {
  detailUrl?: string;
  chapters?: ComicChapter[];
  currentIndex?: number;
  parentParam?: string;
}

export function useChapterReader() {
  const { chapterParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | undefined;
  const detailUrl = state?.detailUrl;
  const chapters = state?.chapters || [];
  const currentIndex = state?.currentIndex ?? -1;
  const parentParam = state?.parentParam;

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [user, setUser] = useState<any>(null);

  // Local storage helpers
  const LOCAL_KEY = "readHistory";

  const getLocalHistory = (): Record<string, string[]> => {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : {};
  };

  const saveLocalHistory = (data: Record<string, string[]>) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

const markAsRead = async (chapter: string) => {
  if (!parentParam) return;
  const key = parentParam;

  // --- Ambil dari localStorage ---
  const localData = getLocalHistory();
  const prevLocal = localData[key] || [];

  // Hapus dulu chapter ini dari daftar (kalau sudah ada)
  const filtered = prevLocal.filter((c: string) => c !== chapter);

  // Tambahkan ke akhir agar jadi "terakhir dibaca"
  localData[key] = [...filtered, chapter];
  saveLocalHistory(localData);

  // --- Simpan ke Firestore kalau login ---
  if (user) {
    const ref = doc(db, "readHistory", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const dbData = snap.data().data || {};
      const prevFirestore = dbData[key] || [];

      const filteredFirestore = prevFirestore.filter((c: string) => c !== chapter);
      dbData[key] = [...filteredFirestore, chapter];

      await updateDoc(ref, { data: dbData });
    } else {
      await setDoc(ref, { uid: user.uid, data: localData });
    }
  }
};

  // Fetch chapter data
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const proxyUrl =
          detailUrl
            ?.replace("https://weeb-scraper.onrender.com/api", "/api-komiku")
            ?.replace("http://weeb-scraper.onrender.com/api", "/api-komiku") ||
          `/api-komiku/chapter/${chapterParam}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

        const json = await res.json();
        setPages(json.data);

        // ✅ tandai bab yang sedang dibuka sebagai sudah dibaca
        if (chapterParam) await markAsRead(chapterParam);
      } catch (err) {
        console.error("Error fetching chapter:", err);
      } finally {
        setLoading(false);
        setShowNavbar(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    fetchChapter();
  }, [chapterParam, detailUrl]);

  // Scroll listener (auto-hide navbar)
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (Math.abs(currentScroll - lastScroll) > 20) {
        setShowNavbar(false);
        setLastScroll(currentScroll);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  // UI actions
  const handleToggleNavbar = () => setShowNavbar((prev) => !prev);

  const goToChapter = async (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    const next = chapters[index];

    // ✅ tandai bab baru sebelum pindah
    await markAsRead(next.param);

    setPages([]);
    setShowNavbar(true);
    navigate(`/chapter/${next.param}`, {
      state: { detailUrl: next.detail_url, chapters, currentIndex: index, parentParam },
        replace: true, // 👈 ini penting
    });
  };

  const handleBack = () => {
    navigate(`/detail/${parentParam}`, { replace: true });
  };

  // Return hook API
  return {
    pages,
    loading,
    showNavbar,
    chapters,
    currentIndex,
    handleBack,
    handleToggleNavbar,
    goToChapter,
  };
}
