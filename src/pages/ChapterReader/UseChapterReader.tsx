//Logic

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ComicChapter } from "../../types/types";

interface LocationState {
  detailUrl?: string;
  chapters?: ComicChapter[];
  currentIndex?: number;
  parentParam?: string;
}

export function useChapterReader() {
  const { chapterParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | undefined;
  const detailUrl = state?.detailUrl;
  const chapters = state?.chapters || [];
  const currentIndex = state?.currentIndex ?? -1;
  const parentParam = state?.parentParam;

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        const proxyUrl =
          detailUrl
            ?.replace("https://weeb-scraper.onrender.com/api", "/api-komiku")
            ?.replace("http://weeb-scraper.onrender.com/api", "/api-komiku") ||
          `/api-komiku/chapter/${chapterParam}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP error! ${res.status}`);
        const json = await res.json();
        setPages(json.data);
      } catch (err) {
        console.error("Error fetching chapter:", err);
      } finally {
        setLoading(false);
        setShowNavbar(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    fetchChapter();
  }, [chapterParam, detailUrl]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (Math.abs(currentScroll - lastScroll) > 20) {
        setShowNavbar(false);
        setLastScroll(currentScroll);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const handleToggleNavbar = () => setShowNavbar((prev) => !prev);

  const goToChapter = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    const next = chapters[index];
    setPages([]);
    setShowNavbar(true);
    navigate(`/chapter/${next.param}`, {
      state: { detailUrl: next.detail_url, chapters, currentIndex: index, parentParam },
    });
  };

  const handleBack = () => {
    navigate(`/detail/${parentParam}`, { replace: true });
  };

  return {
    pages,
    loading,
    showNavbar,
    chapters,
    currentIndex,
    handleBack,
    handleToggleNavbar,
    goToChapter,
  };
}
