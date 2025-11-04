import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../component/Navbar";
import icon1 from "../../assets/icon1.png";
import type { ComicItem, FavoriteData } from "./FavoriteLogic";

interface FavoriteViewProps {
  loading: boolean;
  comics: ComicItem[];
  favorites: FavoriteData[];
  showConfirm: boolean;
  navigate: (path: string, opts?: any) => void;
  toggleFavorite: (param: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

const FavoriteView = ({
  loading,
  comics,
  favorites,
  showConfirm,
  navigate,
  toggleFavorite,
  confirmDelete,
  cancelDelete,
}: FavoriteViewProps) => {
  if (loading)
    return (
      <div className="bg-[#171717] text-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-1">
          <img
            src={icon1}
            alt="Loading..."
            className="w-32 h-32 animate-pulse mb-3"
          />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <Navbar />

      <div className="px-4 sm:px-6 py-4 flex-1">
        {comics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400 text-center">
            <p>Belum ada komik yang difavoritkan</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/40">
            {comics.map((c) => {
              const isFavorite = favorites.some((f) => f.param === c.param);
              return (
                <div
                  key={c.param}
                  className="flex items-center justify-between cursor-pointer hover:opacity-80 transition py-0.5"
                >
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    onClick={() =>
                      navigate(`/detail/${c.param}`, {
                        state: `https://web-scrapper-comic.vercel.app/api/komiku/${c.param}`,
                      })
                    }
                    className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 object-cover flex-shrink-0 rounded"
                  />

                  <div className="flex justify-between items-center flex-1 pl-4 pr-2">
                    <div
                      onClick={() =>
                        navigate(`/detail/${c.param}`, {
                          state: `https://web-scrapper-comic.vercel.app/api/komiku/${c.param}`,
                        })
                      }
                      className="min-w-0 flex-1"
                    >
                      <h2 className="font-semibold text-base line-clamp-1">
                        {c.title}
                      </h2>
                      {c.favoritedAt && (
                        <p className="text-xs text-gray-400">
                          Difavoritkan pada{" "}
                          {new Date(c.favoritedAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(c.param);
                      }}
                      className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
                        isFavorite
                          ? "bg-gray-600 text-white hover:bg-gray-400"
                          : "border border-gray-500 text-gray-300 hover:border-gray-400 hover:text-white"
                      }`}
                    >
                      {isFavorite ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          <span>Difavoritkan</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg leading-none">+</span>
                          <span>Favorit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🧩 Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-80 sm:w-96 p-6 rounded-2xl shadow-2xl text-center relative"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-xl font-bold mb-3 text-gray-800">
                Hapus dari Favorit?
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Komik ini akan dihapus dari daftar favorit kamu.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Hapus
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 border border-gray-400 text-gray-700 hover:bg-gray-100 font-semibold py-2 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteView;
