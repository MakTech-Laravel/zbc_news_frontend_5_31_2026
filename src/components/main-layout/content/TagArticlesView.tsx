import { useEffect, useState } from "react";
import axios from "axios";

import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { LatestStories } from "@/components/main-layout/content/LatestStories";
import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import type { Article } from "@/data/dummy/types";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { formatTagLabel } from "@/lib/tagPaths";
import NotFound from "@/pages/global/NotFound";
import {
  fetchArticlesByTag,
  type ArticlesByTagType,
} from "@/services/frontend/articles";

type TagArticlesViewProps = {
  tagSlug: string;
};

const TAG_FILTERS: { value: ArticlesByTagType; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "recommended", label: "Recommended" },
];

export function TagArticlesView({ tagSlug }: TagArticlesViewProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<ArticlesByTagType>("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const tagLabel = formatTagLabel(tagSlug.replace(/-/g, " "));

  useDocumentHead({
    path: `/tag/${tagSlug}`,
    title: `${tagLabel} Articles`,
    replacements: { tag: tagLabel },
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setNotFound(false);

    fetchArticlesByTag(tagSlug, filter)
      .then((rows) => {
        if (cancelled) return;
        setArticles(rows);
      })
      .catch((err) => {
        console.error("Failed to fetch tag articles:", err);
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
          return;
        }
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tagSlug, filter]);

  if (notFound) {
    return <NotFound />;
  }

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
        <p className="mt-2 text-muted-foreground">Please try again later.</p>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      {/* <header className="space-y-4">
        <div>
          <h1 className="font-inter text-3xl font-bold text-zbc-gray-1000 sm:text-4xl">
            {tagLabel}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TAG_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-3 py-1.5 font-inter text-xs font-semibold transition-colors ${
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-zbc-gray-1000 hover:text-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header> */}

      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No articles found for this tag yet.
        </p>
      )}

      <AdUnit variant="banner" />
      <LatestStories />
    </article>
  );
}
