// src/pages/History.tsx
import { useNavigate } from "react-router-dom";
import { useHistoryLogic } from "./HistoryLogic";
import { HistoryView } from "./HistoryView";
import type { ComicDetail } from "../../types/types";

export default function History() {
  const navigate = useNavigate();
  const { comics, loading, loadingRead, setLoadingRead } = useHistoryLogic();

  const handleNavigateDetail = (param: string) => {
    navigate(`/detail/${param}`, {
      state: `https://web-scrapper-comic.vercel.app/api/komiku/${param}`,
    });
  };

  const handleContinue = async (c: any) => {
    setLoadingRead(c.param);
    try {
      const res = await fetch(`https://web-scrapper-comic.vercel.app/api/komiku/${c.param}`);
      const json = await res.json();
      const data: ComicDetail = json.data;

      const last = data.chapters.find((ch) => ch.param === c.lastParam);
      if (!last) throw new Error("Chapter terakhir tidak ditemukan");

      const index = data.chapters.findIndex((ch) => ch.param === c.lastParam);

      navigate(`/chapter/${c.lastParam}`, {
        state: {
          detailUrl: last.detail_url,
          chapters: data.chapters,
          parentParam: c.param,
          currentIndex: index,
        },
      });
    } catch (err) {
      console.error("Gagal membuka chapter:", err);
    } finally {
      setLoadingRead(null);
    }
  };

  return (
    <HistoryView
      comics={comics}
      loading={loading}
      loadingRead={loadingRead}
      onContinue={handleContinue}
      onNavigateDetail={handleNavigateDetail}
    />
  );
}
