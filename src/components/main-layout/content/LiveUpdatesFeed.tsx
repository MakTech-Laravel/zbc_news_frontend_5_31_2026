import { useEffect, useState } from "react";

import { ArticleCard } from "@/components/main-layout/content/ArticleCard";
import { Button } from "@/components/ui/button";
import type { Article } from "@/data/dummy/types";
import {
  fetchLiveBlogArticles,
  type PaginationMeta,
} from "@/services/frontend/articles";

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0,
};

/**
 * Public Live Updates listing (`/?section=live_updates`).
 * Shows all live-blog articles: ongoing first, then ended, with pagination.
 */
export function LiveUpdatesFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetchLiveBlogArticles(page, 12)
      .then(({ articles: rows, meta: nextMeta }) => {
        if (cancelled) return;
        setArticles(rows);
        setMeta(nextMeta ?? DEFAULT_META);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setArticles([]);
        setMeta(DEFAULT_META);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const ongoingCount = articles.filter((article) => article.isLive).length;

  return (
    <section className="space-y-5" aria-labelledby="live-updates-feed-heading">
      <div>
        <p className="font-inter text-xs font-semibold uppercase tracking-wide text-primary">
          Live coverage
        </p>
        <h1
          id="live-updates-feed-heading"
          className="font-inter text-2xl font-bold text-zbc-gray-1000"
        >
          Live Updates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ongoing live blogs first, then previous coverage.
          {meta.total > 0
            ? ` ${meta.total} ${meta.total === 1 ? "article" : "articles"}.`
            : null}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[16/10] animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Could not load live updates. Please try again later.
        </p>
      ) : articles.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No live update articles yet.
        </p>
      ) : (
        <>
          {ongoingCount > 0 && page === 1 ? (
            <p className="text-sm font-medium text-red-600">
              {ongoingCount} live now
            </p>
          ) : null}

          <ol className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:gap-6">
            {articles.map((article) => (
              <li key={article.id} className="min-w-0">
                <ArticleCard article={article} />
              </li>
            ))}
          </ol>

          {meta.last_page > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page >= meta.last_page || loading}
                onClick={() =>
                  setPage((current) => Math.min(meta.last_page, current + 1))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
