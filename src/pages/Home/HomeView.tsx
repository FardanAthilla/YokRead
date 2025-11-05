import Navbar from "../../component/Navbar";
import icon1 from "../../assets/icon1.png";
import { useNavigate } from "react-router-dom";
import type { Comic } from "../../types/types";
import type { RefObject } from "react";

interface HomeViewProps {
  featuredComics: Comic[];
  allComics: Comic[];
  featured?: Comic;
  isTransitioning: boolean;
  loading: boolean;
  hasNext: boolean;
  sliderRef: RefObject<HTMLDivElement | null>;
  observerRef: RefObject<HTMLDivElement | null>;
  scrollThumbnails: (dir: "left" | "right") => void;
}

const TRANSITION_DURATION = 400;

const HomeView = ({
  featuredComics,
  allComics,
  featured,
  isTransitioning,
  loading,
  sliderRef,
  observerRef,
  scrollThumbnails,
}: HomeViewProps) => {
  const navigate = useNavigate();

  // 🌀 Loading full screen (pertama kali)
  if (loading && featuredComics.length === 0 && allComics.length === 0) {
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
  }

  return (
    <div className="min-h-screen bg-[#0f1416] text-gray-100">
      <Navbar />

      <main className="px-6 sm:px-10 md:px-16 lg:px-20 py-8">
        {/* 🔸 Featured Section */}
        <section className="relative w-full rounded-2xl overflow-hidden shadow-2xl h-[420px]">
          {!featured ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-gray-800 to-gray-900">
              <p className="text-gray-400">Tidak ada komik untuk ditampilkan</p>
            </div>
          ) : (
            <div className="relative h-full w-full">
              {featuredComics.map((c) => (
                <div
                  key={c.param}
                  className="absolute inset-0 bg-cover bg-center transition-opacity"
                  style={{
                    backgroundImage: `url(${c.thumbnail})`,
                    opacity: featured.param === c.param ? 1 : 0,
                    transitionDuration: `${TRANSITION_DURATION}ms`,
                  }}
                />
              ))}

              {/* Overlay efek */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(5,7,9,0.9) 10%, rgba(5,7,9,0.6) 35%, rgba(5,7,9,0.2) 100%)",
                }}
              />

              <div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{
                  opacity: isTransitioning ? 0.35 : 0,
                  transition: `opacity ${TRANSITION_DURATION}ms`,
                }}
              />

              {/* Konten teks */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-2xl px-6 md:px-12 lg:px-16">
                  <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-gray-300 line-clamp-3">
                    {featured.description ?? "Tidak ada deskripsi tersedia."}
                  </p>

                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={() =>
                        navigate(`/detail/${featured.param}`, {
                          state: featured.detail_url,
                        })
                      }
                      className="flex items-center gap-3 bg-emerald-500/95 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6.5 5.5v9l7-4.5-7-4.5z" />
                      </svg>
                      Baca
                    </button>
                  </div>

                  <div className="mt-6 text-gray-400 flex gap-1 items-center">
                    <span className="text-sm">Total</span>
                    <div className="text-sm text-gray-400 ml-2">
                      {featured.latest_chapter}
                    </div>
                  </div>
                </div>

                <div className="ml-auto pr-8 hidden lg:block">
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="w-48 h-64 rounded-xl object-cover shadow-lg border border-gray-700/50"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 🔸 Thumbnails Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Chapter Baru</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollThumbnails("left")}
                className="p-2 rounded-md bg-gray-800/60 hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => scrollThumbnails("right")}
                className="p-2 rounded-md bg-gray-800/60 hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide"
          >
            {featuredComics.map((c) => (
              <div
                key={c.param}
                onClick={() =>
                  navigate(`/detail/${c.param}`, { state: c.detail_url })
                }
                className="relative min-w-[140px] sm:min-w-[160px] md:min-w-[180px] cursor-pointer"
              >
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-full h-44 md:h-52 object-cover rounded-lg"
                />
                <div className="mt-2 text-sm text-gray-300 line-clamp-1">
                  {c.title}
                </div>
                <div className="text-xs text-gray-500">{c.latest_chapter}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 🔸 All Comics Grid */}
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Semua Komik</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {allComics.map((c) => (
              <div
                key={c.param}
                onClick={() =>
                  navigate(`/detail/${c.param}`, { state: c.detail_url })
                }
                className="cursor-pointer hover:scale-[1.03] transition-transform"
              >
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-800/40"
                />
                <div className="mt-2 text-sm font-medium text-gray-200 line-clamp-1">
                  {c.title}
                </div>
                <div className="text-xs text-gray-500">{c.latest_chapter}</div>
              </div>
            ))}
          </div>

          <div ref={observerRef} className="flex justify-center py-6">
            {loading && (
              <img
                src={icon1}
                alt="Loading..."
                className="w-16 h-16 animate-pulse"
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeView;
