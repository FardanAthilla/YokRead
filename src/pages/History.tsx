import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../API/firebase";
import type { ComicDetail } from "../types/types";
import icon1 from "../assets/icon1.png";

const LOCAL_KEY = "readHistory";

const getLocalHistory = (): Record<string, string[]> => {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? JSON.parse(data) : {};
};

interface HistoryItem {
  param: string;
  title: string;
  thumbnail: string;
  lastChapter?: string;
  lastParam?: string;
}

const History = () => {
  const [history, setHistory] = useState<Record<string, string[]>>({});
  const [comics, setComics] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRead, setLoadingRead] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔐 Ambil riwayat baca dari Firebase atau LocalStorage
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        const ref = doc(db, "readHistory", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setHistory(snap.data().data || {});
        } else {
          setHistory({});
        }
      } else {
        setHistory(getLocalHistory());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 📚 Fetch detail komik berdasarkan daftar riwayat
  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      const results: HistoryItem[] = [];

      for (const key of Object.keys(history)) {
        try {
          const res = await fetch(`/api-komiku/komiku/${key}`);
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
          const json = await res.json();
          const comic: ComicDetail = json.data;

          const lastParam = history[key]?.slice(-1)[0];
          const last = comic.chapters.find((c) => c.param === lastParam);

          results.push({
            param: comic.param || key,
            title: comic.title,
            thumbnail: comic.thumbnail,
            lastChapter: last?.chapter,
            lastParam: last?.param,
          });
        } catch (e) {
          console.error("Gagal memuat komik:", key, e);
        }
      }

      setComics(results);
      setLoading(false);
    };

    if (Object.keys(history).length > 0) fetchComics();
    else setComics([]);
  }, [history]);

  // 🧭 Jika masih loading data utama
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

  // 🎨 Render ListView tanpa card + gambar full kiri
  return (
    <div className="min-h-screen bg-[#171717] text-white px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Riwayat Bacaan</h1>

      {comics.length === 0 ? (
        <p className="text-gray-400 text-center">
          Belum ada komik yang dibaca.
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
              {/* Gambar full kiri tanpa padding */}
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-28 h-28 object-cover flex-shrink-0"
              />

              {/* Info dan tombol kanan */}
              <div className="flex justify-between items-center flex-1 pl-4 pr-2">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-base line-clamp-1">
                    {c.title}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Terakhir dibaca:{" "}
                    <span className="text-green-400">
                      {c.lastChapter || "-"}
                    </span>
                  </p>
                </div>

                {c.lastParam && (
                  <button
                    disabled={loadingRead === c.param}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setLoadingRead(c.param);
                      try {
                        const res = await fetch(
                          `/api-komiku/komiku/${c.param}`
                        );
                        if (!res.ok)
                          throw new Error(`HTTP error! status: ${res.status}`);
                        const json = await res.json();
                        const data: ComicDetail = json.data;

                        const last = data.chapters.find(
                          (ch) => ch.param === c.lastParam
                        );
                        if (!last)
                          throw new Error("Chapter terakhir tidak ditemukan");

                        const index = data.chapters.findIndex(
                          (ch) => ch.param === c.lastParam
                        );

                        navigate(`/chapter/${c.lastParam}`, {
                          state: {
                            detailUrl: last.detail_url,
                            chapters: data.chapters,
                            parentParam: c.param,
                            currentIndex: index,
                          },
                        });
                      } catch (err) {
                        console.error("Gagal membuka chapter:", err);
                      } finally {
                        setLoadingRead(null);
                      }
                    }}
                    className={`border ml-4 text-sm font-semibold h-8 px-4 rounded-md transition flex items-center justify-center ${
                      loadingRead === c.param
                        ? "border-gray-600 cursor-not-allowed"
                        : "border-gray-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {loadingRead === c.param ? "Memuat..." : "Lanjut Baca"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
