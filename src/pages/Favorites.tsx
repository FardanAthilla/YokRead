import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../API/firebase";
import Navbar from "../component/Navbar";
import icon1 from "../assets/icon1.png";
import pLimit from "p-limit";
import { motion, AnimatePresence } from "framer-motion";

const limit = pLimit(5);

interface FavoriteData {
  param: string;
  favoritedAt: string;
}

interface ComicItem {
  param: string;
  title: string;
  thumbnail: string;
  favoritedAt?: string;
}

const Favorite = () => {
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
      console.log("📢 [Auth] Login status berubah:", u ? u.uid : "Tidak login");
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
      console.log("🧩 [Fetch] Ambil detail komik favorit:", favorites);

      try {
        const promises = favorites.map(({ param, favoritedAt }) =>
          limit(async () => {
            const res = await fetch(`/api-komiku/komiku/${param}`);
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

        const results = (await Promise.all(promises)).filter(
          Boolean
        ) as ComicItem[];
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

    let items: { param: string; favoritedAt: string }[] = snap.exists()
      ? snap.data().items || []
      : [];

    const isFavorite = items.some((item) => item.param === param);

    if (isFavorite) {
      // Konfirmasi dulu sebelum hapus
      setSelectedParam(param);
      setShowConfirm(true);
      return;
    } else {
      // ⭐ Tambah langsung
      const now = new Date().toISOString();
      items.push({ param, favoritedAt: now });
      await setDoc(ref, { items }, { merge: true });
      setFavorites((prev) => [{ param, favoritedAt: now }, ...prev]);
    }
  };

  // ✅ Eksekusi hapus jika dikonfirmasi
  const confirmDelete = async () => {
    if (!selectedParam || !user) return;
    const ref = doc(db, "favorites", user.uid);
    const snap = await getDoc(ref);

    let items: FavoriteData[] = snap.exists() ? snap.data().items || [] : [];
    items = items.filter((item) => item.param !== selectedParam);

    await setDoc(ref, { items }, { merge: true });
    setFavorites((prev) => prev.filter((f) => f.param !== selectedParam));
    console.log(`❌ [Favorite Removed] ${selectedParam}`);

    setShowConfirm(false);
    setSelectedParam(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedParam(null);
  };

  if (loading)
    return (
      <div className="bg-[#171717] text-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-1">
          <img
            src={icon1}
            alt="Loading..."
            className="w-32 h-32 animate-pulse mb-3"
          />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <Navbar />
      <div className="px-6 py-2 flex-1">
        {comics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400 text-center">
            <p>Belum ada komik yang difavoritkan</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/40">
            {comics.map((c) => {
              const isFavorite = favorites.some((f) => f.param === c.param);

              return (
                <div
                  key={c.param}
                  className="flex items-center justify-between cursor-pointer hover:opacity-80 transition py-0.5"
                >
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    onClick={() =>
                      navigate(`/detail/${c.param}`, {
                        state: `/api-komiku/komiku/${c.param}`,
                      })
                    }
                    className="w-28 h-28 object-cover flex-shrink-0"
                  />

                  <div className="flex justify-between items-center flex-1 pl-4 pr-2">
                    <div
                      onClick={() =>
                        navigate(`/detail/${c.param}`, {
                          state: `/api-komiku/komiku/${c.param}`,
                        })
                      }
                      className="min-w-0 flex-1"
                    >
                      <h2 className="font-semibold text-base line-clamp-1">
                        {c.title}
                      </h2>
                      {c.favoritedAt && (
                        <p className="text-xs text-gray-400">
                          Difavoritkan pada{" "}
                          {new Date(c.favoritedAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(c.param);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        isFavorite
                          ? "bg-gray-600 text-white hover:bg-gray-400"
                          : "border border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white"
                      }`}
                    >
                      {isFavorite ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          Difavoritkan
                        </>
                      ) : (
                        <>
                          <span className="text-lg leading-none">+</span>
                          Favorit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🧩 Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-80 sm:w-96 p-6 rounded-2xl shadow-2xl text-center relative"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-xl font-bold mb-3 text-gray-800">
                Hapus dari Favorit?
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Komik ini akan dihapus dari daftar favorit kamu.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Hapus
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 border border-gray-400 text-gray-700 hover:bg-gray-100 font-semibold py-2 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favorite;
