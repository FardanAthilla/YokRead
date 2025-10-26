import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ComicChapter } from "../types/types";

interface LocationState {
  detailUrl?: string;
  chapters?: ComicChapter[];
  currentIndex?: number;
  parentParam?: string;
}

const ChapterReader = () => {
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

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const proxyUrl =
          detailUrl
            ?.replace("https://weeb-scraper.onrender.com/api", "/api-komiku")
            ?.replace("http://weeb-scraper.onrender.com/api", "/api-komiku") ||
          `/api-komiku/chapter/${chapterParam}`;

        console.log("📖 Fetching chapter from:", proxyUrl);
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
        const json = await res.json();

        setPages(json.data);
      } catch (err) {
        console.error("❌ Error fetching chapter:", err);
      } finally {
        setLoading(false);
        setShowNavbar(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    fetchChapter();
  }, [chapterParam, detailUrl]);

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

  const handleToggleNavbar = () => setShowNavbar((prev) => !prev);

  const goToChapter = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    const next = chapters[index];
    setPages([]);
    setShowNavbar(true);
    navigate(`/chapter/${next.param}`, {
      state: {
        detailUrl: next.detail_url,
        chapters,
        currentIndex: index,
        parentParam,
      },
    });
  };

  const handleBack = () => {
    navigate(`/detail/${parentParam}`, { replace: true });
  };

  if (loading || pages.length === 0)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div
          className={`fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md p-3 flex items-center text-white transition-transform duration-300 ${
            showNavbar ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="ml-3 text-lg font-semibold">
            {chapters[currentIndex]?.chapter || "Chapter"}
          </h1>
        </div>
      </div>
    );

  return (
    <div className="relative w-full md:max-w-3xl md:mx-auto md:p-4 min-h-screen text-white">
      {/* Navbar atas */}
      <div
  className={`fixed top-0 left-0 w-full z-[9999] bg-black/90 backdrop-blur-md p-3 flex items-center text-white transition-transform duration-300 ${
    showNavbar ? "translate-y-0" : "-translate-y-full"
  }`}
  style={{ pointerEvents: "auto" }}
>

        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="ml-3 text-lg font-semibold">
          {chapters[currentIndex]?.chapter || "Chapter"}
        </h1>
      </div>

      {/* Gambar halaman */}
      <div className="flex flex-col" onClick={handleToggleNavbar}>
        {pages.map((img, i) => (
          <FadeInImage key={i} src={img} alt={`Page ${i + 1}`} />
        ))}
      </div>

      {/* Tombol navigasi bawah */}
      <div
        className={`fixed bottom-0 right-0 w-full bg-black/80 backdrop-blur-md text-white flex justify-end items-center px-4 py-3 transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex gap-4">
          {/* Prev */}
          <button
            onClick={() => goToChapter(currentIndex + 1)}
            disabled={currentIndex + 1 >= chapters.length}
            className="hover:opacity-80 disabled:opacity-40 transition-opacity"
            title="Chapter Sebelumnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={() => goToChapter(currentIndex - 1)}
            disabled={currentIndex <= 0}
            className="hover:opacity-80 disabled:opacity-40 transition-opacity"
            title="Chapter Berikutnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5L15.75 12l-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* 🔥 Komponen khusus gambar dengan efek fade-in */
const FadeInImage = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={`w-full object-contain select-none transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      loading="lazy"
    />
  );
};

export default ChapterReader;
