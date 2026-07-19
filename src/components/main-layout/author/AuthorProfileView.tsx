import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { Button } from "@/components/ui/button";
import type { Article } from "@/data/dummy/types";
import NotFound from "@/pages/global/NotFound";
import {
  AuthorProfileNotFoundError,
  fetchAuthorBySlug,
} from "@/services/frontend/authors";
import type { PublicAuthor } from "@/types/author";
import { useEffect, useState } from "react";

import {
  AuthorProfileHeader,
  AuthorProfileHeaderSkeleton,
} from "./AuthorProfileHeader";

type AuthorProfileViewProps = {
  authorSlug: string;
};

function AuthorArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

export function AuthorProfileView({ authorSlug }: AuthorProfileViewProps) {
  const [author, setAuthor] = useState<PublicAuthor | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [authorSlug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setNotFound(false);

    fetchAuthorBySlug(authorSlug, page)
      .then((result) => {
        if (cancelled) return;
        setAuthor(result.author);
        setArticles(result.articles);
        setLastPage(result.meta.last_page);
        setTotal(result.meta.total);
      })
      .catch((err) => {
        console.error("Failed to fetch author profile:", err);
        if (cancelled) return;
        if (err instanceof AuthorProfileNotFoundError) {
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
  }, [authorSlug, page]);

  if (notFound) {
    return <NotFound />;
  }

  if (loading) {
    return (
      <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
        <AuthorProfileHeaderSkeleton />
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <AuthorArticlesSkeleton />
        </div>
      </article>
    );
  }

  if (error || !author) {
    return (
      <article className="rounded-xl border border-border bg-card p-8 text-center">
        <h1 className="font-inter text-2xl font-bold text-zbc-gray-1000">
          Could not load author profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Please try again later.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => {
            setError(false);
            setLoading(true);
            fetchAuthorBySlug(authorSlug, page)
              .then((result) => {
                setAuthor(result.author);
                setArticles(result.articles);
                setLastPage(result.meta.last_page);
                setTotal(result.meta.total);
              })
              .catch(() => setError(true))
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </Button>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      <AuthorProfileHeader author={author} />

      <section aria-labelledby="author-articles-heading" className="space-y-5">
        <header>
          <h2
            id="author-articles-heading"
            className="font-inter text-2xl font-bold text-zbc-gray-1000 sm:text-3xl"
          >
            Published Articles
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {total} {total === 1 ? "article" : "articles"} by {author.name}
          </p>
        </header>

        {articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No published articles from this author yet.
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
      </section>

      <AdUnit variant="banner" slotKey="content_banner_primary" />
    </article>
  );
}
