import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../API/firebase";
import type { ComicDetail } from "../types/types";
import icon1 from "../assets/icon1.png";
import LoginModal from "../component/Login";
import { Heart } from "lucide-react";

// LocalStorage helpers
const LOCAL_KEY = "readHistory";

const getLocalHistory = (): Record<string, string[]> => {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? JSON.parse(data) : {};
};

const saveLocalHistory = (data: Record<string, string[]>) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
};

// Sync to Firebase
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

// Main Component
const Detail = () => {
  const { param } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detailUrl = location.state as string | undefined;

  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chapter" | "similar">("chapter");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [readHistory, setReadHistory] = useState<Record<string, string[]>>({});

  const [showLogin, setShowLogin] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch detail data
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

  // Handle Auth & Sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const synced = await syncLocalToFirebase(u.uid);
        setReadHistory(synced);

        // Cek apakah komik ini sudah difavoritkan
        const favRef = doc(db, "favorites", u.uid);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()) {
          const favs = favSnap.data().items || [];
          setIsFavorite(favs.includes(param));
        }
      }

      if (u) {
        setUser(u);
        const synced = await syncLocalToFirebase(u.uid);
        setReadHistory(synced);
      } else {
        setUser(null);
        setReadHistory(getLocalHistory());
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchDetail(detailUrl);
  }, [param, detailUrl]);

  // Mark chapter as read
  const markAsRead = async (chapterParam: string) => {
    if (!comic) return;
    const key = comic.param || param;
    if (!key) return;

    const updated = { ...readHistory };
    const prev = updated[key] || [];

    // Hapus dulu jika sudah pernah ada, lalu tambahkan di akhir
    const filtered = prev.filter((c) => c !== chapterParam);
    updated[key] = [...filtered, chapterParam];

    setReadHistory(updated);

    if (user) {
      await updateDoc(doc(db, "readHistory", user.uid), { data: updated });
    } else {
      saveLocalHistory(updated);
    }
  };

//togglefavorit
  const toggleFavorite = async () => {
  if (!user) {
    setShowLogin(true);
    return;
  }

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

  // UI Loading / Error
  if (isLoading || !comic)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#171717] text-white transition-all duration-300">
        <img
          src={icon1}
          alt="Loading..."
          className="w-32 h-32 animate-pulse mb-3"
        />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-[#171717] text-white">
        <p className="text-red-500">Gagal memuat data: {error}</p>
      </div>
    );

  // Render
  return (
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Header */}
      {/* Header */}
<div className="fixed top-0 left-0 w-full bg-[#171717]/90 backdrop-blur-md p-3 flex items-center justify-between z-50">
  <button
    onClick={() => navigate("/")}
    className="p-2 hover:bg-gray-800 rounded-lg transition"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-6 h-6 text-white"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* Tombol Favorit */}
  <button
    onClick={toggleFavorite}
    className={`p-2 rounded-full transition ${
      isFavorite ? "text-red-500" : "text-gray-400 hover:text-white"
    }`}
  >
    <Heart fill={isFavorite ? "currentColor" : "none"} className="w-6 h-6" />
  </button>
</div>


      {/* Cover & Detail Info */}
      <div className="pt-24 px-6 max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <img
            src={comic.thumbnail}
            alt={comic.title}
            className="w-64 h-80 object-cover rounded-xl"
          />
        </div>

        <div className="flex flex-col justify-center text-left w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{comic.title}</h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {comic.synopsis}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {comic.genre
              .filter((g) => g.trim() !== "")
              .map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-800 text-green-400 rounded-md text-sm"
                >
                  {g.trim()}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="px-6 mt-8 flex border-b border-gray-700">
        {["chapter", "similar"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "chapter" | "similar")}
            className={`relative px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab ? "text-green-400" : "text-gray-400"
            }`}
          >
            {tab === "chapter" ? "Chapter" : "Serial Serupa"}
            {activeTab === tab && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-green-400 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-6 mt-4 pb-20">
        {activeTab === "chapter" ? (
          <ul className="space-y-2">
            {comic.chapters.map((ch) => {
              const alreadyRead = readHistory[ch.param]?.includes(ch.param);
              return (
                <li
                  key={ch.param}
                  onClick={() => {
                    markAsRead(ch.param);
                    navigate(`/chapter/${ch.param}`, {
                      state: {
                        detailUrl: ch.detail_url,
                        chapters: comic.chapters,
                        parentParam: param,
                        currentIndex: comic.chapters.findIndex(
                          (c) => c.param === ch.param
                        ),
                      },
                    });
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    alreadyRead
                      ? "bg-gray-700"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={alreadyRead ? "text-green-400" : ""}>
                      {ch.chapter}
                    </span>
                    <span className="text-xs text-gray-400">{ch.release}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="-mb-14 mt-6 grid gap-4 lg:gap-6 grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {comic.similars && comic.similars.length > 0 ? (
              comic.similars.map((s, i) => (
                <div
                  key={i}
                  onClick={() => {
                    navigate(`/detail/${s.param}`, { state: s.detail_url });
                    setActiveTab("chapter");
                  }}
                  className="group relative cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative w-full overflow-hidden rounded-xl shadow-md shadow-black/30">
                    <img
                      src={s.thumbnail}
                      alt={s.title}
                      className="w-full h-56 md:h-64 lg:h-72 object-cover rounded-xl transition-transform duration-300 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    <p className="absolute bottom-2 left-2 right-2 text-white font-semibold text-sm md:text-base line-clamp-2 drop-shadow-md">
                      {s.title}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-full">
                Tidak ada serial serupa.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Read Buttons */}
      {activeTab === "chapter" && comic && (
        <div className="px-6 fixed bottom-0 left-0 w-full p-4 bg-[#171717]/95 backdrop-blur-md space-y-2">
          {readHistory[param ?? ""]?.length > 0 ? (
            (() => {
              const lastParam = readHistory[param ?? ""]?.slice(-1)[0];
              const last = comic.chapters.find((c) => c.param === lastParam);
              const lastLabel = last ? last.chapter : "Terakhir Dibaca";

              return (
                <button
                  onClick={() => {
                    if (last) {
                      navigate(`/chapter/${last.param}`, {
                        state: {
                          detailUrl: last.detail_url,
                          chapters: comic.chapters,
                          parentParam: param,
                          currentIndex: comic.chapters.findIndex(
                            (c) => c.param === last.param
                          ),
                        },
                      });
                    }
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Lanjut Baca {lastLabel}
                </button>
              );
            })()
          ) : (
            <button
              onClick={() => {
                if (comic.chapters?.length > 0) {
                  const first = comic.chapters[comic.chapters.length - 1];
                  navigate(`/chapter/${first.param}`, {
                    state: {
                      detailUrl: first.detail_url,
                      chapters: comic.chapters,
                      parentParam: param,
                      currentIndex: comic.chapters.findIndex(
                        (c) => c.param === first.param
                      ),
                    },
                  });
                }
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
            >
              Baca Episode 1
            </button>
          )}
        </div>
      )}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Detail;
