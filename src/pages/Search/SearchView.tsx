import Navbar from "../../component/Navbar";
import icon1 from "../../assets/icon1.png";
import type { Comic } from "../../types/types";

interface Props {
  input: string;
  setInput: (val: string) => void;
  comics: Comic[];
  loading: boolean;
  hasSearched: boolean;
  query: string;
  onSearch: (e: React.FormEvent) => void;
  onNavigate: (param: string) => void;
}

export const SearchView = ({
  input,
  setInput,
  comics,
  loading,
  hasSearched,
  query,
  onSearch,
  onNavigate,
}: Props) => {
  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <Navbar />

      {/* 🔎 Search bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/10">
        <form
          onSubmit={onSearch}
          className="flex items-center gap-2 bg-[#1f1f1f] rounded-lg px-3 py-2"
        >
          <input
            type="text"
            placeholder="Cari komik..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm sm:text-base placeholder-gray-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold transition"
          >
            Cari
          </button>
        </form>
      </div>

      {/* 🧾 Content Area */}
      <div className="px-4 sm:px-6 py-4 flex-1">
        {loading ? (
          // Loading State — icon di tengah layar
          <div className="flex justify-center items-center h-[60vh]">
            <img
              src={icon1}
              alt="Loading..."
              className="w-24 h-24 animate-pulse opacity-80"
            />
          </div>
        ) : !hasSearched ? (
          // Belum mencari
          <div className="flex justify-center items-center h-[60vh] text-gray-400 text-center">
            <p>Ketik judul komik untuk mencari.</p>
          </div>
        ) : comics.length === 0 ? (
          // Tidak ada hasil
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
            <p>
              Tidak ada hasil untuk{" "}
              <span className="text-white font-semibold">"{query}"</span>
            </p>
          </div>
        ) : (
          // Daftar hasil komik
          <div className="flex flex-col divide-y divide-white/40">
            {comics.map((c) => (
              <div
                key={c.param}
                onClick={() => onNavigate(c.param)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition py-3"
              >
                {/* Thumbnail */}
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 object-cover flex-shrink-0 rounded"
                />

                {/* Info */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-1 gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm sm:text-base line-clamp-2 sm:line-clamp-1 mb-1">
                      {c.title}
                    </h2>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {c.latest_chapter || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  {/* Tombol Baca */}
                  <button className="border border-gray-500 hover:bg-green-600 text-white text-xs sm:text-sm font-semibold h-8 sm:h-9 px-3 sm:px-4 rounded-md transition-all duration-200 flex items-center justify-center whitespace-nowrap flex-shrink-0">
                    Baca
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
