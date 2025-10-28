import FadeInImage from "./FadeInImage";
import icon1 from "../../assets/icon1.png";
import type { ComicChapter } from "../../types/types";

interface Props {
  loading: boolean;
  pages: string[];
  showNavbar: boolean;
  chapters: ComicChapter[];
  currentIndex: number;
  handleBack: () => void;
  handleToggleNavbar: () => void;
  goToChapter: (index: number) => void;
}

const ChapterReaderView = ({
  loading,
  pages,
  showNavbar,
  chapters,
  currentIndex,
  handleBack,
  handleToggleNavbar,
  goToChapter,
}: Props) => {
  if (loading || pages.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-white relative overflow-hidden">
        <div className="fixed top-0 left-0 w-full z-[9999] bg-black/90 backdrop-blur-md p-3 flex items-center text-white">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="ml-3 text-lg font-semibold">
            {chapters[currentIndex]?.chapter || "Loading..."}
          </h1>
        </div>

        <img
          src={icon1}
          alt="Logo Outline"
          className="w-32 h-32 animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full md:max-w-3xl md:mx-auto md:p-4 min-h-screen text-white" onClick={handleToggleNavbar}>
      {/* Navbar atas */}
      <div
        className={`fixed top-0 left-0 w-full z-[9999] bg-black/90 backdrop-blur-md p-3 flex items-center text-white transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className="ml-3 text-lg font-semibold">
          {chapters[currentIndex]?.chapter || "Chapter"}
        </h1>
      </div>

      {/* Gambar halaman */}
      <div className="flex flex-col">
        {pages.map((img, i) => (
          <FadeInImage key={i} src={img} alt={`Page ${i + 1}`} />
        ))}
      </div>

      {/* Tombol bawah */}
      <div
        className={`fixed bottom-0 right-0 w-full bg-black/80 backdrop-blur-md text-white flex justify-end items-center px-4 py-3 transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex gap-4">
          <button
            onClick={() => goToChapter(currentIndex + 1)}
            disabled={currentIndex + 1 >= chapters.length}
            className="hover:opacity-80 disabled:opacity-40 transition-opacity"
            title="Chapter Sebelumnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <button
            onClick={() => goToChapter(currentIndex - 1)}
            disabled={currentIndex <= 0}
            className="hover:opacity-80 disabled:opacity-40 transition-opacity"
            title="Chapter Berikutnya"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5L15.75 12l-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterReaderView;
