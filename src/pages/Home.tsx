import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Comic } from "../types/types";
import icon1 from "../assets/icon1.png";
import Navbar from "../component/Navbar";

const AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 400;

const Home = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const autoplayRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const fetchComics = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://web-scrapper-comic.vercel.app/api/komiku?page=${pageNumber}`
      );
      const json = await res.json();
      if (json.data?.length > 0) {
        setComics(json.data);
        setHasNext(true);
        setFeaturedIndex(0);
      } else {
        setHasNext(false);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics(page);
  }, [page]);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = window.setInterval(() => {
      setIsTransitioning(true);
      window.setTimeout(() => {
        setFeaturedIndex((prev) =>
          comics.length ? (prev + 1) % comics.length : 0
        );
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }, AUTOPLAY_INTERVAL) as unknown as number;
  }, [comics.length]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (comics.length > 0) startAutoplay();
    return () => stopAutoplay();
  }, [comics.length, startAutoplay, stopAutoplay]);

  const scrollThumbnails = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -width / 2 : width / 2,
      behavior: "smooth",
    });
  };

  const featured = comics[featuredIndex];

  if (loading) {
    return (
      <div className="bg-[#171717] text-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-1">
          <img src={icon1} alt="Loading..." className="w-32 h-32 animate-pulse mb-3" />
        </div>
      </div>
    );
  }

  // 🔹 Normal render
  return (
    <div className="min-h-screen bg-[#0f1416] text-gray-100">
      <Navbar />

      <main className="px-6 sm:px-10 md:px-16 lg:px-20 py-8">
        <section className="relative w-full rounded-2xl overflow-hidden shadow-2xl h-[420px]">
          {!featured ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-gray-800 to-gray-900">
              <p className="text-gray-400">Tidak ada komik untuk ditampilkan</p>
            </div>
          ) : (
            <div className="relative h-full w-full">
              {comics.map((c, idx) => (
                <div
                  key={c.param}
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-400"
                  style={{
                    backgroundImage: `url(${c.thumbnail})`,
                    opacity: idx === featuredIndex ? 1 : 0,
                    transitionDuration: `${TRANSITION_DURATION}ms`,
                  }}
                  aria-hidden={idx !== featuredIndex}
                />
              ))}

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(5,7,9,0.9) 10%, rgba(5,7,9,0.6) 35%, rgba(5,7,9,0.2) 100%)",
                  transition: `opacity ${TRANSITION_DURATION}ms`,
                  opacity: isTransitioning ? 1 : 1,
                }}
              />

              <div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{
                  opacity: isTransitioning ? 0.35 : 0,
                  transition: `opacity ${TRANSITION_DURATION}ms`,
                }}
              />

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
                    <div className="flex items-center">
                      <span className="text-sm">Total</span>
                    </div>

                    <div className="text-sm text-gray-400">
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

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Kamu mungkin suka</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollThumbnails("left")}
                className="p-2 rounded-md bg-gray-800/60 hover:bg-gray-700"
              >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>              </button>
              <button
                onClick={() => scrollThumbnails("right")}
                className="p-2 rounded-md bg-gray-800/60 hover:bg-gray-700"
              >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide"
            style={{
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
            }}
          >
            {comics.map((c, idx) => (
              <div
                key={c.param}
                onClick={() =>
                  navigate(`/detail/${c.param}`, { state: c.detail_url })
                }
                className={`relative overflow-visible min-w-[140px] sm:min-w-[160px] md:min-w-[180px] cursor-pointer transform transition-transform duration-200`}
                style={{ willChange: "transform" }}
              >
                <div
                  className={`rounded-lg shadow-md transform transition-transform duration-200 ${
                    idx === featuredIndex ? "scale-105 z-20" : "z-10"
                  }`}
                >
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-44 md:h-52 object-cover rounded-lg"
                    onMouseEnter={(e) => {
                      const el = e.currentTarget.parentElement;
                      if (el) el.classList.add("z-20");
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget.parentElement;
                      if (el) el.classList.remove("z-20");
                    }}
                  />
                </div>

                <div className="mt-2 text-sm text-gray-300 line-clamp-1">
                  {c.title}
                </div>
                <div className="text-xs text-gray-500">{c.latest_chapter}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={`px-4 py-2 rounded-lg ${
              page === 1 || loading
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 text-black font-semibold hover:bg-emerald-500"
            }`}
          >
            ← Sebelumnya
          </button>

          <span className="text-gray-300 font-medium">Halaman {page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className={`px-4 py-2 rounded-lg ${
              !hasNext || loading
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 text-black font-semibold hover:bg-emerald-500"
            }`}
          >
            Berikutnya →
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
