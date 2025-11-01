import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../API/firebase";
import type { ComicDetail } from "../types/types";
import icon1 from "../assets/icon1.png";

interface FavoriteItem {
  param: string;
  title: string;
  thumbnail: string;
}

const Favorite = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comics, setComics] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔐 Ambil data favorit dari Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        const ref = doc(db, "favorites", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setFavorites(data.items || []);
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

  // 📚 Ambil detail komik berdasarkan favorit
  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      const results: FavoriteItem[] = [];

      for (const param of favorites) {
        try {
          const res = await fetch(`/api-komiku/komiku/${param}`);
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
          const json = await res.json();
          const comic: ComicDetail = json.data;

          results.push({
            param: comic.param || param,
            title: comic.title,
            thumbnail: comic.thumbnail,
          });
        } catch (e) {
          console.error("Gagal memuat favorit:", param, e);
        }
      }

      setComics(results);
      setLoading(false);
    };

    if (favorites.length > 0) fetchComics();
    else setComics([]);
  }, [favorites]);

  // ⏳ Tampilan saat loading
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#171717] text-white">
        <img
          src={icon1}
          alt="Loading..."
          className="w-32 h-32 animate-pulse mb-3"
        />
      </div>
    );

  // 🎨 Render tampilan favorit
  return (
    <div className="min-h-screen bg-[#171717] text-white px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Favorit Saya</h1>

      {comics.length === 0 ? (
        <p className="text-gray-400 text-center">
          Belum ada komik yang difavoritkan.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-white/40">
          {comics.map((c) => (
            <div
              key={c.param}
              onClick={() =>
                navigate(`/detail/${c.param}`, {
                  state: `/api-komiku/komiku/${c.param}`,
                })
              }
              className="flex items-center justify-between cursor-pointer hover:opacity-80 transition py-0.5"
            >
              {/* Thumbnail kiri */}
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-28 h-28 object-cover flex-shrink-0"
              />

              {/* Info kanan */}
              <div className="flex justify-between items-center flex-1 pl-4 pr-2">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-base line-clamp-1">
                    {c.title}
                  </h2>
                  <p className="text-xs text-gray-400">Komik favorit</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorite;
