import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Comic } from "../../types/types";

export const useSearchLogic = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [input, setInput] = useState(query);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!query);

  // 🔍 Fetch data komik berdasarkan query
  useEffect(() => {
    if (!query) return;
    const fetchComics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://web-scrapper-comic.vercel.app/api/komiku?s=${query}`);
        const data = await res.json();
        setComics(data?.data || []);
      } catch (err) {
        console.error("Gagal fetch komik:", err);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    };
    fetchComics();
  }, [query]);

  // 🧭 Handle submit search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSearchParams({ q: input });
  };

  // 🧩 Handle klik komik
  const handleNavigate = (param: string) => {
    navigate(`/detail/${param}`);
  };

  return {
    input,
    setInput,
    comics,
    loading,
    hasSearched,
    query,
    handleSearch,
    handleNavigate,
  };
};
