import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import SearchPage from "../pages/Search/Search";
import Detail from "../pages/Detail/Detail";
import ChapterReader from "../pages/ChapterReader/ChapterReader";
import NotFound from "../pages/Error/Error";
import History from "../pages/History/History";
import Favorite from "../pages/Favorite/Favorite";
import GenreView from "../pages/Genre/Genre";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/detail/:param/*" element={<Detail />} />
      <Route path="/chapter/:param" element={<ChapterReader />} />
      <Route path="/history" element={<History />} />
      <Route path="/favorites" element={<Favorite />} />
      <Route path="/genre/" element={<GenreView />} />
    </Routes>
  );
};

export default AppRouter;
