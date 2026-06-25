import { useEffect, useState } from "react";
import axios from "axios";

import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { LatestStories } from "@/components/main-layout/content/LatestStories";
import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { Button } from "@/components/ui/button";
import type { Article } from "@/data/dummy/types";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import NotFound from "@/pages/global/NotFound";
import { fetchArticlesByCategory } from "@/services/frontend/articles";

type CategoryArticlesViewProps = {
  categorySlug: string;
};

export function CategoryArticlesView({ categorySlug }: CategoryArticlesViewProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categorySeo, setCategorySeo] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useDocumentHead({
    path: `/${categorySlug}`,
    title: categorySeo.metaTitle || undefined,
    description: categorySeo.metaDescription || undefined,
    keywords: categorySeo.metaKeywords || undefined,
    replacements: { category: categoryTitle || categorySlug.replace(/-/g, " ") },
  });

  useEffect(() => {
    setPage(1);
  }, [categorySlug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setNotFound(false);

    fetchArticlesByCategory(categorySlug, page)
      .then(({ categoryTitle: title, categorySeo: seo, articles: rows, meta }) => {
        if (cancelled) return;
        setCategoryTitle(title);
        setCategorySeo(seo);
        setArticles(rows);
        setLastPage(meta?.last_page ?? 1);
        setTotal(meta?.total ?? rows.length);
      })
      .catch((err) => {
        console.error("Failed to fetch category articles:", err);
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
  }, [categorySlug, page]);

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
          {total} {total === 1 ? "article" : "articles"}
        </p>
      </header>

      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No articles found in this category yet.
        </p>
      )}

      {lastPage > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= lastPage}
            onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <AdUnit variant="banner" />
      <LatestStories />
    </article>
  );
}
