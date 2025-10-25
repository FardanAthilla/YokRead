import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ComicDetail } from "../types/types";

const Detail = () => {
  const { param } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detailUrl = location.state as string | undefined;
  const [comic, setComic] = useState<ComicDetail | null>(null);

  useEffect(() => {
    const cacheKey = `detail-${param}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setComic(JSON.parse(cached));
      return; // langsung pakai cache
    }

    const fetchDetail = async () => {
      try {
        const proxyUrl =
          detailUrl
            ?.replace("https://weeb-scraper.onrender.com/api", "/api-komiku")
            ?.replace("http://weeb-scraper.onrender.com/api", "/api-komiku") ||
          `/api-komiku/komiku/${param}`;

        console.log("🔍 Fetching detail from:", proxyUrl);

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const json = await res.json();
        setComic(json.data);
        sessionStorage.setItem(cacheKey, JSON.stringify(json.data));
      } catch (err) {
        console.error("❌ Error fetching detail:", err);
      }
    };

    fetchDetail();
  }, [param, detailUrl]);

  if (!comic)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading detail...</p>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Kembali
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={comic.thumbnail}
          alt={comic.title}
          className="w-64 h-80 object-cover rounded-xl"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{comic.title}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {comic.genre
              .filter((g) => g.trim() !== "")
              .map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                >
                  {g.trim()}
                </span>
              ))}
          </div>
          <p className="text-gray-700 whitespace-pre-line">{comic.synopsis}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Daftar Chapter</h2>
      <ul className="space-y-2">
        {comic.chapters.map((ch) => (
          <li
            key={ch.param}
            className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() =>
              navigate(`/chapter/${ch.param}`, { state: ch.detail_url })
            }
          >
            <div className="flex justify-between items-center">
              <span>{ch.chapter}</span>
              <span className="text-sm text-gray-500">{ch.release}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Detail;
