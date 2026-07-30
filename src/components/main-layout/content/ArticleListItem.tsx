import { Link } from "react-router-dom";

import { ArticleMediaThumb } from "@/components/main-layout/shared/media/ArticleMediaThumb";
import { ArticleMeta } from "@/components/main-layout/shared/ArticleMeta";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
import { LiveCoverageBadge } from "@/components/main-layout/shared/LiveCoverageBadge";
import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";

type ArticleListItemProps = {
  article: Article;
  className?: string;
  hideViewsBelowSm?: boolean;
};

export function ArticleListItem({ article, className, hideViewsBelowSm }: ArticleListItemProps) {
  return (
    <article
      className={cn(
        "flex gap-3 py-4 sm:gap-4 sm:py-[18px]",
        className,
      )}
    >
      <Link to={article.slug ? `/${article.slug}` : "/"} className="shrink-0">
        <ArticleMediaThumb
          media={article.featuredMedia}
          fallbackSrc={article.imageUrl}
          alt={article.title}
          width={96}
          height={96}
          className="size-[80px] shrink-0 rounded-lg ring-1 ring-border sm:size-[96px]"
          imageClassName="rounded-lg"
        />
      </Link>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag label={article.category} className="bg-brand-soft text-primary" />
          <LiveCoverageBadge
            isLiveBlog={article.isLiveBlog}
            isLive={article.isLive}
            liveEndedAtIso={article.liveEndedAtIso}
          />
        </div>
        <Link to={article.slug ? `/${article.slug}` : "/"} className="block">
          <h3 className="line-clamp-2 font-inter text-base font-semibold leading-[1.15] text-zbc-gray-1000 mb-2 hover:text-primary">
            {article.title}
          </h3>
        </Link>
          <ArticleMeta
            author={article.author}
            readTime={article.readTime}
            views={article.views}
            commentCount={article.commentCount ?? 0}
            commentHref={article.slug ? `/${article.slug}#comments` : undefined}
            publishedAt={article.publishedAt}
            publishedAtIso={article.publishedAtIso}
            updatedAtIso={article.updatedAtIso}
            hideViewsBelowSm={hideViewsBelowSm}
          />
      </div>
    </article>
  );
}
