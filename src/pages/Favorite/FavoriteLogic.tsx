import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../API/firebase";
import pLimit from "p-limit";

const limit = pLimit(5);

export interface FavoriteData {
  param: string;
  favoritedAt: string;
}

export interface ComicItem {
  param: string;
  title: string;
  thumbnail: string;
  favoritedAt?: string;
}

export const useFavoriteLogic = () => {
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedParam, setSelectedParam] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔐 Ambil data favorit dari Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(true);

      if (u) {
        const ref = doc(db, "favorites", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const favList: FavoriteData[] = data.items || [];
          favList.sort(
            (a, b) =>
              new Date(b.favoritedAt).getTime() -
              new Date(a.favoritedAt).getTime()
          );
          setFavorites(favList);
        } else {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ⚡ Ambil semua detail komik favorit
  useEffect(() => {
    const fetchComics = async () => {
      if (favorites.length === 0) {
        setComics([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const promises = favorites.map(({ param, favoritedAt }) =>
          limit(async () => {
            const res = await fetch(
              `https://web-scrapper-comic.vercel.app/api/komiku/${param}`
            );
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const json = await res.json();
            const comic = json.data;

            return {
              param: comic.param || param,
              title: comic.title,
              thumbnail: comic.thumbnail,
              favoritedAt,
            } as ComicItem;
          })
        );

        const results = (await Promise.all(promises)).filter(Boolean) as ComicItem[];
        setComics(results);
      } catch (err) {
        console.error("🔥 [Fetch Error] Gagal ambil data favorit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [favorites]);

  // 🧠 Toggle favorit (hapus atau tambah)
  const toggleFavorite = async (param: string) => {
    if (!user) return alert("Silakan login terlebih dahulu.");

    const ref = doc(db, "favorites", user.uid);
    const snap = await getDoc(ref);
    let items: FavoriteData[] = snap.exists() ? snap.data().items || [] : [];
    const isFavorite = items.some((item) => item.param === param);

    if (isFavorite) {
      setSelectedParam(param);
      setShowConfirm(true);
      return;
    } else {
      const now = new Date().toISOString();
      items.push({ param, favoritedAt: now });
      await setDoc(ref, { items }, { merge: true });
      setFavorites((prev) => [{ param, favoritedAt: now }, ...prev]);
    }
  };

  // ✅ Konfirmasi hapus favorit
  const confirmDelete = async () => {
    if (!selectedParam || !user) return;
    const ref = doc(db, "favorites", user.uid);
    const snap = await getDoc(ref);
    let items: FavoriteData[] = snap.exists() ? snap.data().items || [] : [];

    items = items.filter((item) => item.param !== selectedParam);
    await setDoc(ref, { items }, { merge: true });

    setFavorites((prev) => prev.filter((f) => f.param !== selectedParam));
    setShowConfirm(false);
    setSelectedParam(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedParam(null);
  };

  return {
    favorites,
    comics,
    loading,
    user,
    showConfirm,
    selectedParam,
    navigate,
    toggleFavorite,
    confirmDelete,
    cancelDelete,
  };
};
