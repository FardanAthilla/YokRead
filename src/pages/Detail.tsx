import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ComicDetail } from "../types/types";
import icon1 from "../assets/icon1.png";

const Detail = () => {
  const { param } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detailUrl = location.state as string | undefined;
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const proxyUrl =
          detailUrl
            ?.replace("https://weeb-scraper.onrender.com/api", "/api-komiku")
            ?.replace("http://weeb-scraper.onrender.com/api", "/api-komiku") ||
          `/api-komiku/komiku/${param}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const json = await res.json();
        setComic(json.data as ComicDetail);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchDetail();
  }, [param, detailUrl]);

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Gagal memuat data: {error}</p>
      </div>
    );

  if (!comic)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md p-3 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
        <img
          src={icon1}
          alt="Logo Outline"
          className="w-32 h-32 animate-pulse"
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-[#171717] backdrop-blur-md p-3 flex items-center">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Cover & Detail Info */}
      <div className="pt-24 px-6 max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Cover */}
        <div className="flex justify-center md:justify-start w-full md:w-auto">
          <img
            src={comic.thumbnail}
            alt={comic.title}
            className="w-64 h-80 object-cover rounded-xl"
          />
        </div>

        {/* Detail Info */}
        <div className="flex flex-col justify-center md:justify-start md:text-left w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{comic.title}</h1>
          {/* Synopsis */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {comic.synopsis}
          </p>
          {/* Genre */}
          <div className="flex flex-wrap justify-start md:justify-start gap-2 mt-3">
            {comic.genre
              .filter((g) => g.trim() !== "")
              .map((g, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-800 text-green-400 rounded-md text-sm"
                >
                  {g.trim()}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="px-6 mt-8 pb-20">
        <h2 className="text-xl font-semibold mb-4">Chapter</h2>
        <ul className="space-y-2">
          {comic.chapters.map((ch) => (
            <li
              key={ch.param}
              onClick={() => {
                navigate(`/chapter/${ch.param}`, {
                  state: {
                    detailUrl: ch.detail_url,
                    chapters: comic.chapters,
                    parentParam: param,
                    currentIndex: comic.chapters.findIndex(
                      (c) => c.param === ch.param
                    ),
                  },
                });
              }}
              className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <span>{ch.chapter}</span>
                <span className="text-xs text-gray-400">{ch.release}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Read Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-black/90 backdrop-blur-md">
        <button
          onClick={() => {
            if (comic.chapters.length > 0) {
              const first = comic.chapters[comic.chapters.length - 1];
              navigate(`/chapter/${first.param}`, {
                state: {
                  detailUrl: first.detail_url,
                  chapters: comic.chapters,
                  parentParam: param,
                  currentIndex: comic.chapters.findIndex(
                    (c) => c.param === first.param
                  ),
                },
              });
            }
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
        >
          Baca Episode 1
        </button>
      </div>
    </div>
  );
};

export default Detail;
