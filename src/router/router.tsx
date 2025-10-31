import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Detail from "../pages/Detail";
import ChapterReader from "../pages/ChapterReader/ChapterReader";
import NotFound from "../pages/Error/Error";
import History from "../pages/History";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/detail/:param/*" element={<Detail />} />
      <Route path="/chapter/:param" element={<ChapterReader />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
};

export default AppRouter;
