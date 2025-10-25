import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const ChapterReader = () => {
  const { chapterParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detailUrl = location.state as string | undefined;
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    const cacheKey = `chapter-${chapterParam}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setPages(JSON.parse(cached));
      return; // langsung pakai cache
    }

    const fetchChapter = async () => {
      try {
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
        sessionStorage.setItem(cacheKey, JSON.stringify(json.data));
      } catch (err) {
        console.error("❌ Error fetching chapter:", err);
      }
    };

    fetchChapter();
  }, [chapterParam, detailUrl]);

  if (pages.length === 0)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading chapter...</p>
      </div>
    );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Kembali
      </button>

      <div className="flex flex-col">
        {pages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Page ${i + 1}`}
            className="w-full object-contain select-none"
            loading="lazy"
            style={{
              display: "block",
              marginBottom: "0",
              borderRadius: "0",
              boxShadow: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChapterReader;
