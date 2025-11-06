import React from "react";
import { useGenreViewLogic } from "./GenreLogic";
import GenreViewUI from "./GenreView";

const GenreView: React.FC = () => {
  // 🔹 Ambil semua data dan fungsi dari logic hook
  const {
    activeTab,
    setActiveTab,
    items,
    loading,
    lastItemRef,
    GENRE_LABELS,
  } = useGenreViewLogic();

  // 🔹 Kirim semuanya ke komponen view (UI)
  return (
    <GenreViewUI
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      items={items}
      loading={loading}
      lastItemRef={lastItemRef}
      GENRE_LABELS={GENRE_LABELS}
    />
  );
};

export default GenreView;
