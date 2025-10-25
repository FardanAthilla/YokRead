import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { Comic } from "../types/types";

const SearchPage = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query) return;
      try {
        const res = await fetch(`https://weeb-scraper.onrender.com/api?s=${encodeURIComponent(query)}`);
        const json = await res.json();
        setComics(json.data || []);
      } catch (err) {
        console.error("Error fetching search:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Hasil Pencarian: {query}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <img
            src="https://www.svgrepo.com/show/173880/loading-arrows.svg"
            alt="Loading icon"
            className="w-16 h-16 animate-spin"
          />
        </div>
      ) : comics.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Tidak ada hasil ditemukan.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                className="rounded-t-xl w-full h-56 object-cover"
              />
              <div className="p-3">
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
  );
};

export default SearchPage;
