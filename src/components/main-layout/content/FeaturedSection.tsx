import { Link } from "react-router-dom";
// import { ListPlus, Play } from "lucide-react";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
// import { Button } from "@/components/ui/button";
import { useMostReadArticles } from "@/hooks/useMostReadArticles";
import { cn } from "@/lib/utils";

import { ArticleMeta } from "../shared/ArticleMeta";

export function FeaturedSection() {
  const { topArticle, loading } = useMostReadArticles();

  const articleHref = topArticle?.slug
    ? `/news-details/${encodeURIComponent(topArticle.slug)}`
    : "/news-details";

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
    return null;
  }

  return (
    <div>
      <h2 className="mb-2 font-general-sans text-3xl font-bold text-zbc-gray-1000">
        Top Headlines
      </h2>
      <div
        className="overflow-hidden rounded-xs border border-border bg-zbc-gray-900 shadow-sm"
        aria-label="Featured media"
      >
        <div className="relative aspect-[16/10] min-h-[200px] w-full sm:aspect-[21/9] sm:min-h-[240px] lg:min-h-[280px]">
          <Link to={articleHref} className="block h-full w-full">
            <ArticleImage
              src={topArticle.imageUrl}
              alt={topArticle.title}
              width={1200}
              height={560}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </Link>
          <div
            className="absolute inset-0 bg-gradient-to-t from-zbc-gray-900 via-zbc-gray-900/60 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6">
            {/* <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-9 gap-2 rounded-lg bg-primary-foreground px-4 font-sans text-[13px] font-semibold text-foreground shadow-sm hover:bg-zbc-gray-100"
              >
                <Play className="size-4 fill-foreground" aria-hidden />
                Play
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-2 rounded-lg border-white/30 bg-black/25 px-4 font-sans text-[13px] font-semibold text-primary-foreground backdrop-blur-sm hover:bg-black/40"
              >
                <ListPlus className="size-4" aria-hidden />
                My List
              </Button>
            </div> */}
            <nav
              aria-label="Featured categories"
              className="mt-5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <Link
                to={articleHref}
                className={cn(
                  "shrink-0 rounded-full bg-primary px-3.5 py-1.5 font-sans text-[12px] font-medium text-primary-foreground transition-colors",
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
