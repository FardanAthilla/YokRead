import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar";
import icon1 from "../../assets/icon1.png";
import type { Comic } from "../../types/types";
import type { GenreKey } from "./GenreLogic";

interface GenreViewUIProps {
  activeTab: GenreKey;
  setActiveTab: (tab: GenreKey) => void;
  items: Comic[];
  loading: boolean;
  lastItemRef: React.RefObject<HTMLDivElement | null>;
  GENRE_LABELS: Record<GenreKey, string>;
}

const GenreViewUI: React.FC<GenreViewUIProps> = ({
  activeTab,
  setActiveTab,
  items,
  loading,
  lastItemRef,
  GENRE_LABELS,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1416] text-gray-100">
      <Navbar />

      <main className="px-6 sm:px-10 md:px-16 lg:px-20 py-8">
        {/* 🔹 Scrollable Tab Selector */}
        <div className="px-6 mb-5 border-b border-gray-700 overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap space-x-4 min-w-max">
            {(Object.keys(GENRE_LABELS) as GenreKey[]).map((g) => (
              <button
                key={g}
                onClick={() => setActiveTab(g)}
                className={`relative px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === g ? "text-green-400" : "text-gray-400"
                }`}
              >
                {GENRE_LABELS[g]}
                {activeTab === g && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-green-400 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 🔹 Grid Content */}
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-10">
            <img
              src={icon1}
              alt="Loading..."
              className="w-16 h-16 animate-pulse"
            />
          </div>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            Tidak ada komik untuk genre ini.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {items.map((comic, i) => {
              const isLast = i === items.length - 1;
              return (
                <div
                  key={comic.param}
                  ref={isLast ? lastItemRef : null}
                  onClick={() =>
                    navigate(`/detail/${comic.param}`, {
                      state: comic.detail_url,
                    })
                  }
                  className="cursor-pointer hover:scale-[1.03] transition-transform"
                >
                  <div className="relative">
                    <img
                      src={comic.thumbnail}
                      alt={comic.title}
                      className="w-full h-48 object-cover rounded-lg shadow-md border border-gray-800/40"
                    />
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-200 line-clamp-1">
                    {comic.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {comic.latest_chapter}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loader bawah kalau masih bisa load */}
        {loading && items.length > 0 && (
          <div className="flex justify-center py-6">
            <img
              src={icon1}
              alt="Loading..."
              className="w-16 h-16 animate-pulse"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default GenreViewUI;
