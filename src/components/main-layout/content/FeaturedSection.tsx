import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ArticleMediaHoverThumb } from "@/components/main-layout/shared/media/ArticleMediaHoverThumb";
import { LiveCoverageBadge } from "@/components/main-layout/shared/LiveCoverageBadge";
import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";
import {
  fetchGridArticles,
  fetchMostReadArticles,
  type MostReadPeriod,
} from "@/services/frontend/articles";

import { ArticleMeta } from "../shared/ArticleMeta";

async function resolveTopHeadline(): Promise<Article | null> {
  // Prefer today's most-read; fall back so the section does not disappear on quiet days.
  const periods: MostReadPeriod[] = ["today", "week", "month", "all"];
  for (const period of periods) {
    const result = await fetchMostReadArticles({ period, page: 1, perPage: 1 });
    if (result.articles[0]) {
      return result.articles[0];
    }
  }

  const grid = await fetchGridArticles();
  return grid[0] ?? null;
}

export function FeaturedSection() {
  const [topArticle, setTopArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    resolveTopHeadline()
      .then((article) => {
        if (!cancelled) {
          setTopArticle(article);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load Top Headlines:", error);
        if (!cancelled) {
          setTopArticle(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const articleHref = topArticle?.slug
    ? `/${encodeURIComponent(topArticle.slug)}`
    : "/";

  if (loading) {
    return (
      <div>
        <h2 className="mb-2 font-general-sans text-3xl font-bold text-zbc-gray-1000">
          Top Headlines
        </h2>
        <div className="h-[280px] animate-pulse rounded-xs bg-muted lg:h-[320px]" />
      </div>
    );
  }

  if (!topArticle) {
    return (
      <div>
        <h2 className="mb-2 font-general-sans text-3xl font-bold text-zbc-gray-1000">
          Top Headlines
        </h2>
        <p className="text-sm text-muted-foreground">No headlines available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 font-general-sans text-3xl font-bold text-zbc-gray-1000">
        Top Headlines
      </h2>
      <div
        className="overflow-hidden rounded-lg border border-border bg-zbc-gray-900 shadow-sm"
        aria-label="Featured media"
      >
        <div className="relative aspect-[16/10] min-h-[200px] w-full sm:aspect-[21/9] sm:min-h-[240px] lg:min-h-[280px]">
          <Link to={articleHref} className="absolute inset-0 block h-full w-full">
            <ArticleMediaHoverThumb
              media={topArticle.featuredMedia}
              fallbackSrc={topArticle.imageUrl}
              alt={topArticle.title}
              className="absolute inset-0 h-full w-full"
            />
          </Link>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zbc-gray-900 via-zbc-gray-900/60 to-transparent"
            aria-hidden
          />
          <LiveCoverageBadge
            isLiveBlog={topArticle.isLiveBlog}
            isLive={topArticle.isLive}
            liveEndedAtIso={topArticle.liveEndedAtIso}
            className="pointer-events-none absolute left-4 top-4 z-10"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6">
            <nav
              aria-label="Featured categories"
              className="mt-5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <Link
                to={articleHref}
                className={cn(
                  "pointer-events-auto shrink-0 rounded-full bg-primary px-3.5 py-1.5 font-sans text-[12px] font-medium text-primary-foreground transition-colors",
                )}
              >
                {topArticle.category}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="ml-4">
          <Link
            to={articleHref}
            className="mt-1 line-clamp-2 cursor-pointer font-inter text-2xl font-bold leading-[1.15] text-zbc-gray-1000 hover:text-primary sm:leading-tight lg:text-3xl"
          >
            {topArticle.title}
          </Link>
          <div className="mt-2">
            <ArticleMeta
              author={topArticle.author}
              readTime={topArticle.readTime}
              views={topArticle.views}
              commentCount={topArticle.commentCount ?? 0}
              commentHref={topArticle.slug ? `${articleHref}#comments` : undefined}
              publishedAt={topArticle.publishedAt}
              publishedAtIso={topArticle.publishedAtIso}
              updatedAtIso={topArticle.updatedAtIso}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
