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
          } catch (err) {
            console.error("Gagal fetch detail:", err);
          }
        }

        setComics(filtered);
        sessionStorage.setItem("comics", JSON.stringify(filtered));
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  // Drag scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const start = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const stop = () => (isDown = false);
    const move = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.2; // kecepatan geser
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", start);
    el.addEventListener("mouseleave", stop);
    el.addEventListener("mouseup", stop);
    el.addEventListener("mousemove", move);

    return () => {
      el.removeEventListener("mousedown", start);
      el.removeEventListener("mouseleave", stop);
      el.removeEventListener("mouseup", stop);
      el.removeEventListener("mousemove", move);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="p-6">
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

      {/* 📚 Daftar Komik */}
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
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 no-scrollbar cursor-grab active:cursor-grabbing"
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
                  className="rounded-t-xl w-full h-56 object-cover"
                />
                <div className="p-3">
                  <h2 className="text-lg font-semibold line-clamp-2">
                    {comic.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {comic.latest_chapter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧩 Berdasarkan Genre */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Berdasarkan Genre</h2>
      <div className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar pb-3">
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
