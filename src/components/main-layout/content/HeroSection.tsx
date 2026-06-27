import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";
import { request } from "@/api/request";
import { mapArticleListItem } from "@/services/frontend/articles";

type HeroSectionProps = {
  className?: string;
};

export function HeroSection({ className }: HeroSectionProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestArticle = async () => {
      try {
        const response = await request.get("/articles/latest");
        const data = response.data.data;
        setArticle(mapArticleListItem(data));
      } catch (error) {
        console.error("Failed to fetch latest article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestArticle();
  }, []);

  if (loading) {
    return (
      <div className="h-[320px] animate-pulse rounded-xs bg-muted" />
    );
  }

  if (!article) return null;

  return (
    <section className={cn("relative", className)} aria-label="Featured story">
      <Link
        to={article.slug ? `/news-details/${article.slug}` : "/news-details"}
        className="group block overflow-hidden rounded-xs border border-border bg-card shadow-sm"
      >
        <div className="relative aspect-[16/10] min-h-[220px] w-full sm:aspect-[2/1] sm:min-h-[260px] lg:min-h-[320px]">
          <ArticleImage
            src={article.imageUrl ?? ""}
            alt={article.title}
            width={1400}
            height={700}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="eager"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-zbc-gray-900 via-zbc-gray-900/50 to-zbc-gray-900/10"
            aria-hidden
          />
          <div className="absolute top-4 left-4">
            <CategoryTag label={article.category} />
          </div>
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:space-y-2.5 sm:p-6 lg:space-y-3 lg:p-4">
            <h2 className="line-clamp-2 max-w-[95%] font-inter text-2xl font-bold leading-[1.15] text-primary-foreground sm:leading-tight lg:max-w-3xl lg:text-5xl">
              {article.title}
            </h2>
            {article.excerpt ? (
              <p className="line-clamp-2 max-w-2xl font-normal font-inter text-base leading-5 text-white/90 sm:leading-6">
                {article.excerpt}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </section>
  );
}