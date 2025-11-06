import { useEffect, useRef, useState } from "react";
import type { Comic } from "../../types/types";

export type GenreKey =
  | "action"
  | "psychological"
  | "fantasy"
  | "game"
  | "adventure"
  | "drama"
  | "school"
  | "mystery";

export const GENRE_LABELS: Record<GenreKey, string> = {
  action: "Action",
  psychological: "Psychological",
  fantasy: "Fantasy",
  game: "Game",
  adventure: "Adventure",
  drama: "Drama",
  school: "School",
  mystery: "Mystery",
};

const MAX_ITEMS = 50;

export const useGenreViewLogic = () => {
  const [activeTab, setActiveTab] = useState<GenreKey>("action");
  const [comicsByGenre, setComicsByGenre] = useState<
    Record<GenreKey, Comic[] | null>
  >({
    action: null,
    psychological: null,
    fantasy: null,
    game: null,
    adventure: null,
    drama: null,
    school: null,
    mystery: null,
  });

  const [pageByGenre, setPageByGenre] = useState<Record<GenreKey, number>>({
    action: 1,
    psychological: 1,
    fantasy: 1,
    game: 1,
    adventure: 1,
    drama: 1,
    school: 1,
    mystery: 1,
  });

  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Fetch data komik berdasarkan genre
  async function fetchGenre(genre: GenreKey, page = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://web-scrapper-comic.vercel.app/api/komiku/genre/${genre}?page=${page}`
      );
      const data = await res.json();

      setComicsByGenre((prev) => {
        const existing = prev[genre] ?? [];
        const combined = [...existing, ...(data.data ?? data)];
        const unique = Array.from(
          new Map(combined.map((item) => [item.param, item])).values()
        );
        return { ...prev, [genre]: unique.slice(0, MAX_ITEMS) };
      });

      setPageByGenre((p) => ({ ...p, [genre]: page }));
    } catch (err) {
      console.error("Gagal fetch genre:", err);
      setComicsByGenre((s) => ({ ...s, [genre]: [] }));
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Load genre saat pertama kali diakses
  useEffect(() => {
    if (comicsByGenre[activeTab] === null) {
      fetchGenre(activeTab, 1);
    }
  }, [activeTab]);

  // 🔹 Infinite scroll
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          !loading &&
          (comicsByGenre[activeTab]?.length ?? 0) < MAX_ITEMS
        ) {
          fetchGenre(activeTab, pageByGenre[activeTab] + 1);
        }
      },
      { threshold: 1 }
    );

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }
  }, [activeTab, comicsByGenre[activeTab], loading]);

  const items = comicsByGenre[activeTab] ?? [];

  return {
    activeTab,
    setActiveTab,
    comicsByGenre,
    items,
    loading,
    lastItemRef,
    GENRE_LABELS,
  };
};
