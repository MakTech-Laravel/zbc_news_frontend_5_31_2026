import { useEffect, useState } from "react";

import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { LatestStories } from "@/components/main-layout/content/LatestStories";
import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import type { Article } from "@/data/dummy/types";
import { fetchArticlesByCategory } from "@/services/frontend/articles";

type CategoryArticlesViewProps = {
  categorySlug: string;
};

export function CategoryArticlesView({ categorySlug }: CategoryArticlesViewProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchArticlesByCategory(categorySlug)
      .then(({ categoryTitle: title, articles: rows }) => {
        if (cancelled) return;
        setCategoryTitle(title);
        setArticles(rows);
      })
      .catch((err) => {
        console.error("Failed to fetch category articles:", err);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  if (loading) {
    return (
      <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[16/10] animate-pulse rounded-xs bg-muted" />
          ))}
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="font-inter text-2xl font-bold text-zbc-gray-1000">
          Could not load articles
        </h1>
        <p className="mt-2 text-muted-foreground">
          Please try again later.
        </p>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      <header>
        <h1 className="font-inter text-3xl font-bold capitalize text-zbc-gray-1000 sm:text-4xl">
          {categoryTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
      </header>

      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No articles found in this category yet.
        </p>
      )}

      <AdUnit variant="banner" />
      <LatestStories />
    </article>
  );
}
