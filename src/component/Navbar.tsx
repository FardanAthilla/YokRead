import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LogIn, Search, Menu, X } from "lucide-react";
import { auth } from "../API/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import LoginModal from "./Login";
import LogoutModal from "./ModalLogout";
import icon1 from "../assets/icon1.png";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Pantau status login Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    setShowLogout(true);
    setMobileMenuOpen(false);
  };

  const confirmLogout = async () => {
    await signOut(auth);
    setShowLogout(false);
  };

  // Fungsi untuk menentukan halaman aktif
  const isActive = (path: string) =>
    location.pathname === path
      ? "text-green-400 font-bold"
      : "text-gray-300 hover:text-green-400";

  const isActiveDesktop = (path: string) =>
    location.pathname === path
      ? "text-green-400 font-bold border-b-2 border-green-400 pb-1"
      : "text-gray-300 hover:text-green-400";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1c1c1c]/95 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center z-50">
            <img
              src={icon1}
              alt="Logo"
              width="48"
              height="48"
              className="w-12 h-12 sm:w-14 sm:h-14"
              loading="lazy"
            />
          </Link>

          {/* Desktop Nav menu */}
          <ul className="hidden lg:flex items-center gap-6 text-base font-semibold">
            <li>
              <Link to="/" className={isActiveDesktop("/")}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/genre" className={isActiveDesktop("/genre")}>
                Genre
              </Link>
            </li>
            <li>
              <Link to="/history" className={isActiveDesktop("/history")}>
                History
              </Link>
            </li>
            <li>
              <Link to="/favorites" className={isActiveDesktop("/favorites")}>
                Favorites
              </Link>
            </li>
          </ul>

          {/* Right side - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search button */}
            <button
              onClick={() => navigate("/search")}
              className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Search"
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
                <span className="font-semibold text-base text-gray-200">
                  {user.displayName}
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="p-2 rounded-md hover:bg-white/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 px-4 py-2 text-base font-semibold text-white shadow-md shadow-green-500/30 hover:scale-[1.03] transition-transform duration-200 ease-in-out"
              >
                <LogIn className="inline w-5 h-5 mr-1" /> Login
              </button>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Search button - Mobile */}
            <button
              onClick={() => navigate("/search")}
              className="flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-200" />
            </button>

            {/* Login/User Section - Mobile (di luar hamburger) */}
            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover"
                />
                <button
                  onClick={handleLogoutClick}
                  className="p-2 rounded-md hover:bg-white/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-green-500/30 hover:scale-[1.03] transition-transform duration-200 ease-in-out"
              >
                <LogIn className="inline w-4 h-4 mr-1" /> Login
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition z-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-200" />
              ) : (
                <Menu className="w-6 h-6 text-gray-200" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-3 bg-[#1c1c1c] border-t border-white/10">
            {/* Navigation Links */}
            <Link
              to="/"
              className={`block py-2.5 px-4 rounded-lg text-base font-semibold transition ${isActive(
                "/"
              )} ${
                location.pathname === "/"
                  ? "bg-green-500/10"
                  : "hover:bg-white/5"
              }`}
            >
              Home
            </Link>
            <Link
              to="/genre"
              className={`block py-2.5 px-4 rounded-lg text-base font-semibold transition ${isActive(
                "/genre"
              )} ${
                location.pathname === "/genre"
                  ? "bg-green-500/10"
                  : "hover:bg-white/5"
              }`}
            >
              Genre
            </Link>
            <Link
              to="/history"
              className={`block py-2.5 px-4 rounded-lg text-base font-semibold transition ${isActive(
                "/history"
              )} ${
                location.pathname === "/history"
                  ? "bg-green-500/10"
                  : "hover:bg-white/5"
              }`}
            >
              History
            </Link>
            <Link
              to="/favorites"
              className={`block py-2.5 px-4 rounded-lg text-base font-semibold transition ${isActive(
                "/favorites"
              )} ${
                location.pathname === "/favorites"
                  ? "bg-green-500/10"
                  : "hover:bg-white/5"
              }`}
            >
              Favorites
            </Link>
          </div>
        </div>
      </header>

      {/* Modal Login */}
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => console.log("Login sukses!")}
      />

      {/* Modal Logout Confirmation */}
      <LogoutModal
        show={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Navbar;