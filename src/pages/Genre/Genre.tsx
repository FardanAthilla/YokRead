import { useEffect, useState, useRef } from "react";
import Navbar from "../../component/Navbar";
import icon1 from "../../assets/icon1.png";
import { useNavigate } from "react-router-dom";
import type { Comic } from "../../types/types";

type GenreKey =
  | "action"
  | "romance"
  | "fantasy"
  | "game"
  | "adventure"
  | "drama"
  | "school"
  | "mystery";

const GENRE_LABELS: Record<GenreKey, string> = {
  action: "Action",
  romance: "Romance",
  fantasy: "Fantasy",
  game: "Game",
  adventure: "Adventure",
  drama: "Drama",
  school: "School",
  mystery: "Mystery",
};

const MAX_ITEMS = 50; // batas maksimal 50 data per genre

const GenreView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GenreKey>("action");
  const [comicsByGenre, setComicsByGenre] = useState<
    Record<GenreKey, Comic[] | null>
  >({
    action: null,
    romance: null,
    fantasy: null,
    game: null,
    adventure: null,
    drama: null,
    school: null,
    mystery: null,
  });
  const [pageByGenre, setPageByGenre] = useState<Record<GenreKey, number>>({
    action: 1,
    romance: 1,
    fantasy: 1,
    game: 1,
    adventure: 1,
    drama: 1,
    school: 1,
    mystery: 1,
  });
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (comicsByGenre[activeTab] === null) {
      fetchGenre(activeTab, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchGenre(genre: GenreKey, page = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://web-scrapper-comic.vercel.app/api/komiku/genre/${genre}?page=${page}`
      );
      const data = await res.json();

      setComicsByGenre((prev) => {
        const existing = prev[genre] ?? [];
        const combined = [...existing, ...(data.data ?? data)];

        const unique = Array.from(
          new Map(combined.map((item) => [item.param, item])).values()
        );

        return {
          ...prev,
          [genre]: unique.slice(0, MAX_ITEMS),
        };
      });

      setPageByGenre((p) => ({ ...p, [genre]: page }));
    } catch (err) {
      console.error("Gagal fetch genre", err);
      setComicsByGenre((s) => ({ ...s, [genre]: [] }));
    } finally {
      setLoading(false);
    }
  }

  const items = comicsByGenre[activeTab] ?? [];

  // Infinite scroll handler
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          !loading &&
          (comicsByGenre[activeTab]?.length ?? 0) < MAX_ITEMS
        ) {
          fetchGenre(activeTab, pageByGenre[activeTab] + 1);
        }
      },
      { threshold: 1 }
    );
    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, comicsByGenre[activeTab], loading]);

  return (
    <div className="min-h-screen bg-[#0f1416] text-gray-100">
      <Navbar />

      <main className="px-6 sm:px-10 md:px-16 lg:px-20 py-8">
        {/* 🔹 Scrollable Tab Selector */}
        <div className="px-6 mt-4 mb-5 border-b border-gray-700 overflow-x-auto">
          <div className="flex flex-nowrap space-x-4 min-w-max">
            {(Object.keys(GENRE_LABELS) as GenreKey[]).map((g) => (
              <button
                key={g}
                onClick={() => setActiveTab(g)}
                className={`relative px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === g ? "text-green-400" : "text-gray-400"
                }`}
              >
                {GENRE_LABELS[g]}
                {activeTab === g && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-green-400 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 🔹 Grid Content */}
        {loading && !items.length ? (
          <div className="flex justify-center py-10">
            <img
              src={icon1}
              alt="Loading..."
              className="w-16 h-16 animate-pulse"
            />
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Tidak ada komik untuk genre ini.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {items.map((c, i) => {
              const isLast = i === items.length - 1;
              return (
                <div
                  key={c.param}
                  ref={isLast ? lastItemRef : null}
                  onClick={() =>
                    navigate(`/detail/${c.param}`, { state: c.detail_url })
                  }
                  className="cursor-pointer hover:scale-[1.03] transition-transform"
                >
                  <div className="relative">
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-800/40"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-200 line-clamp-1">
                    {c.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.latest_chapter}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loader bawah kalau masih bisa load */}
        {loading && items.length > 0 && (
          <div className="flex justify-center py-6">
            <img
              src={icon1}
              alt="Loading..."
              className="w-10 h-10 animate-spin"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default GenreView;
