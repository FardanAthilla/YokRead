import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Comic } from "../types/types";

const Home = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true);

        // 🔹 Ambil dua halaman sekaligus
        const [res1, res2] = await Promise.all([
          fetch("/api-komiku/komiku?page=1"),
          fetch("/api-komiku/komiku?page=2"),
        ]);

        const [json1, json2] = await Promise.all([res1.json(), res2.json()]);

        // 🔹 Gabung hasil dari dua halaman
        const combined = [...(json1.data || []), ...(json2.data || [])];

        // 🔹 Simpan ke state
        setComics(combined);
      } catch (err) {
        console.error("Gagal mengambil data komik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="px-6 sm:px-10 md:px-16 lg:px-24 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Daftar Komik Populer
      </h1>

      {/* 🔍 Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex justify-center mb-6 gap-2 max-w-lg mx-auto"
      >
        <input
          type="text"
          placeholder="Cari komik (contoh: Kaguya)..."
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
              alt="Loading icon"
              className="w-16 h-16 animate-spin"
            />
          </div>
        ) : comics.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            ❌ Tidak ada komik yang ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {comics.map((comic) => (
              <div
                key={comic.param}
                className="bg-white rounded-xl shadow hover:scale-105 transition cursor-pointer"
                onClick={() =>
                  navigate(`/detail/${encodeURIComponent(comic.param)}`, {
                    state: comic.detail_url,
                  })
                }
              >
                <img
                  src={comic.thumbnail}
                  alt={comic.title}
                  className="rounded-t-xl w-full h-44 md:h-72 object-cover"
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
    </div>
  );
};

export default Home;
