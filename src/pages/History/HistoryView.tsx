// src/views/HistoryView.tsx
import Navbar from "../../component/Navbar";
import icon1 from "../../assets/icon1.png";
import type { HistoryItem } from "./HistoryLogic";

interface Props {
  comics: HistoryItem[];
  loading: boolean;
  loadingRead: string | null;
  onContinue: (comic: HistoryItem) => Promise<void>;
  onNavigateDetail: (param: string) => void;
}

export const HistoryView = ({
  comics,
  loading,
  loadingRead,
  onContinue,
  onNavigateDetail,
}: Props) => {
  if (loading)
    return (
      <div className="bg-[#171717] text-white min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-1">
          <img src={icon1} alt="Loading..." className="w-32 h-32 animate-pulse mb-3" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <Navbar />
      <div className="px-4 sm:px-6 py-4 flex-1">
        {comics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400 text-center">
            <p>Belum ada komik yang dibaca.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/40">
            {comics.map((c) => (
              <div
                key={c.param}
                onClick={() => onNavigateDetail(c.param)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition py-3"
              >
                {/* Thumbnail - Ukuran responsif */}
                <img 
                  src={c.thumbnail} 
                  alt={c.title} 
                  className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 object-cover flex-shrink-0 rounded" 
                />
                
                {/* Content Area */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-1 gap-2 min-w-0">
                  {/* Text Info */}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm sm:text-base line-clamp-2 sm:line-clamp-1 mb-1">
                      {c.title}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Terakhir dibaca:{" "}
                      <span className="text-green-400">{c.lastChapter || "-"}</span>
                    </p>
                  </div>

                  {/* Button Lanjut Baca */}
                  {c.lastParam && (
                    <button
                      disabled={loadingRead === c.param}
                      onClick={(e) => {
                        e.stopPropagation();
                        onContinue(c);
                      }}
                      className={`border text-xs sm:text-sm font-semibold h-8 sm:h-9 px-3 sm:px-4 rounded-md transition flex items-center justify-center whitespace-nowrap flex-shrink-0 ${
                        loadingRead === c.param
                          ? "border-gray-600 cursor-not-allowed"
                          : "border-gray-500 hover:bg-green-600"
                      } text-white`}
                    >
                      {loadingRead === c.param ? "Memuat..." : "Lanjut Baca"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};