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
      <div className="px-6 py-2 flex-1">
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
                className="flex items-center justify-between cursor-pointer hover:opacity-80 transition py-0.5"
              >
                <img src={c.thumbnail} alt={c.title} className="w-28 h-28 object-cover flex-shrink-0" />
                <div className="flex justify-between items-center flex-1 pl-4 pr-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-base line-clamp-1">{c.title}</h2>
                    <p className="text-xs text-gray-400">
                      Terakhir dibaca:{" "}
                      <span className="text-green-400">{c.lastChapter || "-"}</span>
                    </p>
                  </div>

                  {c.lastParam && (
                    <button
                      disabled={loadingRead === c.param}
                      onClick={(e) => {
                        e.stopPropagation();
                        onContinue(c);
                      }}
                      className={`border ml-4 text-sm font-semibold h-8 px-4 rounded-md transition flex items-center justify-center ${
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
