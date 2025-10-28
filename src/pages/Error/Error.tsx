import { useNavigate, Link } from "react-router-dom";
import icon1 from "../../assets/icon1.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center bg-white">
      <img
        src= {icon1}
        alt="WEBTOON Logo"
        className="w-48 opacity-20 mb-6"
      />

      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
        Uh oh! We can't seem to find this page.
      </h2>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-300 text-white font-medium rounded-full hover:bg-gray-400 transition"
        >
          Kembali
        </button>

        <Link
          to="/"
          className="px-6 py-2 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition"
        >
          Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
