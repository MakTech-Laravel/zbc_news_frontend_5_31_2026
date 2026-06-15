import { useEffect, useState } from "react";

import type { Article } from "@/data/dummy/types";
import { fetchMostReadArticles } from "@/services/frontend/articles";

export function useMostReadArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMostReadArticles()
      .then((data) => {
        if (!cancelled) {
          setArticles(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setArticles([]);
          setError(err instanceof Error ? err.message : "Failed to load most read articles");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    articles,
    topArticle: articles[0] ?? null,
    loading,
    error,
  };
}
