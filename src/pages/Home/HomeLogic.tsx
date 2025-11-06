import { useEffect, useRef, useState, useCallback } from "react";
import type { Comic } from "../../types/types";

const AUTOPLAY_INTERVAL = 3000;
const TRANSITION_DURATION = 400;
const MAX_TOTAL_COMICS = 20;

export const useHomeLogic = () => {
  const [featuredComics, setFeaturedComics] = useState<Comic[]>([]);
  const [allComics, setAllComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const autoplayRef = useRef<number | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Ambil 10 Manhwa pertama untuk featured
  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const limit = 10;
      let collected: Comic[] = [];
      let currentPage = 1;

      while (collected.length < limit) {
        const res = await fetch(
          `https://web-scrapper-comic.vercel.app/api/komiku?page=${currentPage}`
        );
        const json = await res.json();

        const manhwaOnly = (json.data || []).filter(
          (item: Comic) => item.type?.trim().toLowerCase() === "manhwa"
        );

        if (!manhwaOnly.length && (!json.data || !json.data.length)) break;

        const remaining = limit - collected.length;
        collected.push(...manhwaOnly.slice(0, remaining));

        if (collected.length >= limit) break;
        currentPage++;
      }

      // Hapus duplikat (kalau param sama)
      const unique = Array.from(
        new Map(collected.map((c) => [c.param, c])).values()
      );
      setFeaturedComics(unique.slice(0, limit));

      return { lastPage: currentPage };
    } catch (err) {
      console.error("❌ Gagal ambil featured:", err);
      return { lastPage: 1 };
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ambil daftar komik lanjutan (tidak ambil yg udah di featured)
  const fetchAllComics = async (startPage: number, featuredList: Comic[]) => {
    try {
      if (loading || !hasNext) return;
      setLoading(true);

      let collected: Comic[] = [];
      const featuredParams = new Set(featuredList.map((f) => f.param));
      const existingParams = new Set(allComics.map((a) => a.param));
      let currentPage = startPage;
      let hasMore = true;

      while (collected.length < 10 && hasMore) {
        const res = await fetch(
          `https://web-scrapper-comic.vercel.app/api/komiku?page=${currentPage}`
        );
        const json = await res.json();

        let manhwaOnly = (json.data || []).filter(
          (item: Comic) =>
            item.type?.trim().toLowerCase() === "manhwa" &&
            !featuredParams.has(item.param) &&
            !existingParams.has(item.param)
        );

        collected.push(...manhwaOnly);

        if (!json.data || json.data.length === 0) {
          hasMore = false;
          break;
        }

        if (collected.length < 10) currentPage++;
      }

      // Gabungkan tanpa duplikat & batasi maksimal 25 data
      setAllComics((prev) => {
        const merged = [...prev, ...collected];
        const unique = Array.from(
          new Map(merged.map((c) => [c.param, c])).values()
        );
        return unique.slice(0, MAX_TOTAL_COMICS);
      });

      // Stop fetch kalau udah 25 data
      setHasNext(allComics.length + collected.length < MAX_TOTAL_COMICS);
      setPage(currentPage + 1);
    } catch (err) {
      console.error("❌ Gagal ambil allComics:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load awal
  useEffect(() => {
    const load = async () => {
      const { lastPage } = await fetchFeatured();
      await fetchAllComics(lastPage + 1, []);
    };
    load();
  }, []);

  // 🔹 Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasNext) {
          fetchAllComics(page, featuredComics);
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasNext, page, featuredComics]);

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
    featuredComics,
    allComics,
    featured,
    featuredIndex,
    isTransitioning,
    loading,
    hasNext,
    page,
    sliderRef,
    observerRef,
    scrollThumbnails,
  };
};
