import { Link } from "react-router-dom";

import { ArticleMediaHoverThumb } from "@/components/main-layout/shared/media/ArticleMediaHoverThumb";
import { ArticleMeta } from "@/components/main-layout/shared/ArticleMeta";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
import { LiveCoverageBadge } from "@/components/main-layout/shared/LiveCoverageBadge";
import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  className?: string;
};

export function ArticleCard({ article, className }: ArticleCardProps) {
  const articleHref = article.slug ? `/${article.slug}` : "/";
  const commentsHref = article.slug ? `/${article.slug}#comments` : undefined;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link to={articleHref} className="block">
        <ArticleMediaHoverThumb
          media={article.featuredMedia}
          fallbackSrc={article.imageUrl}
          alt={article.title}
          className="aspect-[16/10]"
          imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="space-y-2 p-4">
        <Link to={articleHref} className="block space-y-2">
          <CategoryTag label={article.category} className="bg-brand-soft text-primary" />
          <LiveCoverageBadge
            isLiveBlog={article.isLiveBlog}
            isLive={article.isLive}
            liveEndedAtIso={article.liveEndedAtIso}
          />
          <h3 className="line-clamp-2 font-inter text-lg font-bold text-zbc-gray-1000 hover:text-primary cursor-pointer">
            {article.title}
          </h3>
        </Link>
        <ArticleMeta
          author={article.author}
          readTime={article.readTime}
          views={article.views}
          commentCount={article.commentCount ?? 0}
          commentHref={commentsHref}
          publishedAt={article.publishedAt}
          publishedAtIso={article.publishedAtIso}
          updatedAtIso={article.updatedAtIso}
        />
      </div>
    </article>
  );
}
