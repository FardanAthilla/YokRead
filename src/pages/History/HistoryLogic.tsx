// src/hooks/HistoryLogic.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../API/firebase";
import type { ComicDetail } from "../../types/types";
import pLimit from "p-limit";

export interface HistoryItem {
  param: string;
  title: string;
  thumbnail: string;
  lastChapter?: string;
  lastParam?: string;
}

const LOCAL_KEY = "readHistory";
const getLocalHistory = (): Record<string, string[]> => {
  const data = localStorage.getItem(LOCAL_KEY);
  return data ? JSON.parse(data) : {};
};

export function useHistoryLogic() {
  const [history, setHistory] = useState<Record<string, string[]>>({});
  const [comics, setComics] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRead, setLoadingRead] = useState<string | null>(null);

  // 🔹 Ambil history dari Firebase atau localStorage
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      if (u) {
        const ref = doc(db, "readHistory", u.uid);
        const snap = await getDoc(ref);
        setHistory(snap.exists() ? snap.data().data || {} : {});
      } else {
        setHistory(getLocalHistory());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch semua detail komik berdasarkan history
  useEffect(() => {
    const fetchComics = async () => {
      const keys = Object.keys(history);
      if (keys.length === 0) {
        setComics([]);
        return;
      }

      setLoading(true);
      try {
        const limit = pLimit(5);
        const fetchPromises = keys.map((key) =>
          limit(async () => {
            const res = await fetch(`https://web-scrapper-comic.vercel.app/api/komiku/${key}`);
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            const json = await res.json();
            const comic: ComicDetail = json.data;

            const lastParam = history[key]?.slice(-1)[0];
            const last = comic.chapters.find((c) => c.param === lastParam);

            return {
              param: comic.param || key,
              title: comic.title,
              thumbnail: comic.thumbnail,
              lastChapter: last?.chapter,
              lastParam: last?.param,
            } as HistoryItem;
          })
        );

        const results = await Promise.all(fetchPromises);
        setComics(results.reverse().filter(Boolean) as HistoryItem[]);
      } catch (err) {
        console.error("💥 Error fetching comics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, [history]);

  return { comics, loading, loadingRead, setLoadingRead };
}
