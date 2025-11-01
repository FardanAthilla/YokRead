import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LogIn, Search } from "lucide-react";
import { auth } from "../API/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import LoginModal from "./Login";
import icon1 from "../assets/icon1.png";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Pantau status login Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Fungsi untuk menentukan halaman aktif
  const isActive = (path: string) =>
    location.pathname === path
      ? "text-green-400 font-bold border-b-2 border-green-400 pb-1"
      : "text-gray-300 hover:text-green-400";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1c1c1c]/90 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-8 py-3">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img
                src={icon1}
                alt="Logo"
                width="56"
                height="56"
                loading="lazy"
              />
            </Link>

            {/* Nav menu (desktop) */}
            <ul className="hidden sm:flex items-center gap-5 text-base font-semibold">
              <li>
                <Link to="/" className={isActive("/")}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/genre" className={isActive("/genre")}>
                  Genre
                </Link>
              </li>
              <li>
                <Link to="/history" className={isActive("/history")}>
                  History
                </Link>
              </li>
              <li>
                <Link to="/favorites" className={isActive("/favorites")}>
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4">
            {/* Search button */}
            <button
              onClick={() => navigate("/search")}
              className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition"
            >
              <Search className="w-6 h-6 text-gray-200 hover:text-green-400 transition" />
            </button>

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full border border-white/20 object-cover"
                />

                {/* Nama & Logout (desktop) */}
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-semibold text-sm sm:text-base text-gray-200">
                    {user.displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md hover:bg-white/10 transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-300 hover:text-red-400" />
                  </button>
                </div>

                {/* Logout khusus mobile */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden p-2 rounded-md hover:bg-white/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 px-3 py-1.5 text-sm sm:text-base font-semibold text-white shadow-md shadow-green-500/30 hover:scale-[1.03] transition-transform duration-200 ease-in-out"
              >
                <LogIn className="inline w-5 h-5 mr-1" /> Login
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Modal Login */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => console.log("Login sukses!")}
      />
    </>
  );
};

export default Navbar;
