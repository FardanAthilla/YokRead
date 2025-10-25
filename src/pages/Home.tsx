import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Comic } from "../types/types";

const genres = [
  "action",
  "adventure",
  "comedy",
  "romance",
  "drama",
  "fantasy",
  "school",
  "horror",
  "isekai",
  "sci-fi",
];

const Home = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cachedComics = sessionStorage.getItem("comics");
    if (cachedComics) {
      setComics(JSON.parse(cachedComics));
      setLoading(false);
      return;
    }

    const fetchComics = async () => {
      try {
        const res = await fetch("/api-komiku/komiku");
        const json = await res.json();

        const filtered: Comic[] = [];
        for (const comic of json.data.slice(0, 30)) {
          try {
            const detailRes = await fetch(`/api-komiku/komiku/${comic.param}`);
            const detailJson = await detailRes.json();
            if (
              !detailJson.data.genre.some((g: string) =>
                g.toLowerCase().includes("ecchi")
              )
            ) {
              filtered.push(comic);
            }
          } catch {}
        }

        setComics(filtered);
        sessionStorage.setItem("comics", JSON.stringify(filtered));
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  // ✅ drag-scroll yang bener di desktop + mobile
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const start = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      slider.classList.add("active");
      startX =
        ("touches" in e ? e.touches[0].pageX : e.pageX) - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const end = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x =
        ("touches" in e ? e.touches[0].pageX : e.pageX) - slider.offsetLeft;
      const walk = (x - startX) * 1.3;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", start);
    slider.addEventListener("mouseleave", end);
    slider.addEventListener("mouseup", end);
    slider.addEventListener("mousemove", move);
    slider.addEventListener("touchstart", start, { passive: false });
    slider.addEventListener("touchend", end);
    slider.addEventListener("touchmove", move, { passive: false });

    return () => {
      slider.removeEventListener("mousedown", start);
      slider.removeEventListener("mouseleave", end);
      slider.removeEventListener("mouseup", end);
      slider.removeEventListener("mousemove", move);
      slider.removeEventListener("touchstart", start);
      slider.removeEventListener("touchend", end);
      slider.removeEventListener("touchmove", move);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="p-6 select-none">
      <h1 className="text-3xl font-bold mb-6 text-center">Daftar Komik Populer</h1>

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex justify-center mb-6 gap-2 max-w-lg mx-auto"
      >
        <input
          type="text"
          placeholder="Cari komik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Cari
        </button>
      </form>

      {/* 📚 Komik Scroll */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <img
              src="https://www.svgrepo.com/show/173880/loading-arrows.svg"
              alt="Loading"
              className="w-16 h-16 animate-spin"
            />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-scroll no-scrollbar cursor-grab active:cursor-grabbing pb-4"
          >
            {comics.slice(0, 15).map((comic) => (
              <div
                key={comic.param}
                className="flex-none w-1/5 bg-white rounded-xl shadow hover:scale-105 transition cursor-pointer"
                onClick={() =>
                  navigate(`/detail/${encodeURIComponent(comic.param)}`, {
                    state: comic.detail_url,
                  })
                }
              >
                <img
                  src={comic.thumbnail}
                  alt={comic.title}
                  className="rounded-t-xl w-full h-56 object-cover pointer-events-none"
                />
                <div className="p-3 pointer-events-none">
                  <h2 className="text-lg font-semibold line-clamp-2">
                    {comic.title}
                  </h2>
                  <p className="text-sm text-gray-500">{comic.latest_chapter}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧩 Genre */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Berdasarkan Genre</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => navigate(`/genre/${genre}`)}
            className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 whitespace-nowrap"
          >
            {genre.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
