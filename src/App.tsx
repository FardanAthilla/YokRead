import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import Detail from "./pages/Detail";
import ChapterReader from "./pages/ChapterReader";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/detail/:param" element={<Detail />} />
        <Route path="/chapter/:param" element={<ChapterReader />} />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
