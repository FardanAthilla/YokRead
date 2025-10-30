import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { Comic } from "../types/types";
import { Search, LogIn, LogOut } from "lucide-react";
import icon1 from "../assets/icon1.png";
import { auth } from "../API/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import LoginModal from "../component/Login";

const Home = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Fetch data
  const fetchComics = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api-komiku/komiku?page=${pageNumber}`);
      const json = await res.json();

      if (json.data?.length > 0) {
        setComics(json.data);
        setHasNext(true);
      } else {
        setHasNext(false);
      }
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics(page);
  }, [page]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 px-6 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>

          <div className="flex gap-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/genre" className="text-gray-700 hover:text-blue-600 font-medium">Genre</Link>
            <Link to="/history" className="text-gray-700 hover:text-blue-600 font-medium">History</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/search")}>
            <Search className="w-6 h-6 text-gray-800 hover:text-green-600" />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full border"
              />
              <span className="hidden sm:block font-medium">{user.displayName}</span>
              <button onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
            >
              <LogIn className="w-5 h-5" /> Login
            </button>
          )}
        </div>
      </nav>

      {/* Daftar Komik */}
      <div className="px-6 sm:px-10 md:px-16 lg:px-24 py-6">
<div className="px-6 sm:px-10 md:px-16 lg:px-24 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Rilis Chapter Baru</h1>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <img src={icon1} alt="Logo Outline" className="w-32 h-32 animate-pulse" />
            </div>
          ) : comics.length === 0 ? (
            <div className="text-center text-gray-500 py-20">❌ Tidak ada komik</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {comics.map((comic) => (
                <div
                  key={comic.param}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() =>
                    navigate(`/detail/${encodeURIComponent(comic.param)}`, {
                      state: comic.detail_url,
                    })
                  }
                >
                  <img
                    src={comic.thumbnail}
                    alt={comic.title}
                    className="rounded-xl w-full h-52 md:h-64 object-cover"
                  />
                  <div className="mt-2">
                    <h2 className="text-base md:text-lg font-semibold line-clamp-2">
                      {comic.title}
                    </h2>
                    <p className="text-sm text-gray-500">{comic.latest_chapter}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className={`px-4 py-2 rounded-lg ${
              page === 1 || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ← Sebelumnya
          </button>

          <span className="text-gray-700 font-medium">Halaman {page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
            className={`px-4 py-2 rounded-lg ${
              !hasNext || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Berikutnya →
          </button>
        </div>
      </div>      </div>

      {/* Modal Login Reusable */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => console.log("Login sukses!")}
      />
    </div>
  );
};

export default Home;
