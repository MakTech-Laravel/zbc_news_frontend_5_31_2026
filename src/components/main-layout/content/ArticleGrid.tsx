import { useEffect, useState } from "react";

import type { Article } from "@/data/dummy/types";
import { fetchGridArticles } from "@/services/frontend/articles";
import { cn } from "@/lib/utils";

import { ArticleCard } from "./ArticleCard";

type ArticleGridProps = {
  articles?: Article[];
  title?: string;
  className?: string;
};

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-xs border border-border bg-card"
        >
          <div className="aspect-[16/10] bg-muted" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-6 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArticleGrid({ articles: articlesProp, className }: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>(articlesProp ?? []);
  const [loading, setLoading] = useState(!articlesProp);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articlesProp) {
      setArticles(articlesProp);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchGridArticles()
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
          setError(err instanceof Error ? err.message : "Failed to load articles");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [articlesProp]);

  return (
    <section aria-labelledby="top-headlines-heading" className={cn(className)}>
      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
