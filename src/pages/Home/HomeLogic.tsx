import { useEffect, useRef, useState, useCallback } from "react";
import type { Comic } from "../../types/types";

const AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 400;

export const useHomeLogic = () => {
  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]);
  const [allComics, setAllComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [hasNext, setHasNext] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const autoplayRef = useRef<number | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Fetch page 1 (featured)
  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://web-scrapper-comic.vercel.app/api/komiku/manhwapopuler?page=1`
      );
      const json = await res.json();
      if (json.data?.length > 0) {
        setFeaturedComics(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil featured:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch page 2, 3, dst (all)
  const fetchAllComics = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://web-scrapper-comic.vercel.app/api/komiku/manhwapopuler?page=${pageNumber}`
      );
      const json = await res.json();
      if (json.data?.length > 0) {
        setAllComics((prev) => {
          const merged = [...prev, ...json.data];
          const unique = Array.from(
            new Map(merged.map((item) => [item.param, item])).values()
          );
          return unique;
        });
        setHasNext(true);
      } else {
        setHasNext(false);
      }
    } catch (err) {
      console.error("Gagal mengambil semua komik:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load awal
  useEffect(() => {
    fetchFeatured();
    fetchAllComics(2);
  }, []);

  // 🔹 Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasNext && page < 5) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasNext, page]);

  // 🔹 Fetch page berikutnya
  useEffect(() => {
    if (page > 2) fetchAllComics(page);
  }, [page]);

  // 🔹 Autoplay untuk featured
  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = window.setInterval(() => {
      setIsTransitioning(true);
      window.setTimeout(() => {
        setFeaturedIndex((prev) =>
          featuredComics.length ? (prev + 1) % featuredComics.length : 0
        );
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }, AUTOPLAY_INTERVAL) as unknown as number;
  }, [featuredComics.length]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (featuredComics.length > 0) startAutoplay();
    return () => stopAutoplay();
  }, [featuredComics.length, startAutoplay, stopAutoplay]);

  const scrollThumbnails = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.clientWidth;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -width / 2 : width / 2,
      behavior: "smooth",
    });
  };

  const featured = featuredComics[featuredIndex];

  return {
    // 📦 State
    featuredComics,
    allComics,
    featured,
    featuredIndex,
    isTransitioning,
    loading,
    hasNext,
    page,

    // 📦 Refs
    sliderRef,
    observerRef,

    // 📦 Actions
    scrollThumbnails,
  };
};