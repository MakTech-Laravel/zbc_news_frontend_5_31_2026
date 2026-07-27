import { useCallback, useEffect, useState } from "react";

import type { Article } from "@/data/dummy/types";
import {
  fetchMostReadArticles,
  type MostReadPeriod,
} from "@/services/frontend/articles";

export function useMostReadArticles(
  period: MostReadPeriod = "today",
  perPage = 5,
  enabled = true,
) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setArticles([]);
      setPage(1);
      setHasMore(false);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setArticles([]);
    setPage(1);
    setHasMore(false);
    setError(null);

    fetchMostReadArticles({ period, page: 1, perPage })
      .then((result) => {
        if (!cancelled) {
          setArticles(result.articles);
          setPage(result.meta.current_page);
          setHasMore(result.meta.current_page < result.meta.last_page);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setArticles([]);
          setHasMore(false);
          setError(err instanceof Error ? err.message : "Failed to load most read articles");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, perPage, enabled]);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchMostReadArticles({ period, page: nextPage, perPage });
      setArticles((prev) => {
        const seen = new Set(prev.map((article) => article.id));
        const appended = result.articles.filter((article) => !seen.has(article.id));
        return [...prev, ...appended];
      });
      setPage(result.meta.current_page);
      setHasMore(result.meta.current_page < result.meta.last_page);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load more articles");
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, hasMore, loading, loadingMore, page, period, perPage]);

  return {
    articles,
    topArticle: articles[0] ?? null,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  };
}
