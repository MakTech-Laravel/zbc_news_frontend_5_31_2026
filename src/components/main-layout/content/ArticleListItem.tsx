import { Link } from "react-router-dom";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import { ArticleMeta } from "@/components/main-layout/shared/ArticleMeta";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
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
      <Link to={`/news-details`} className="shrink-0">
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          width={96}
          height={96}
          className="size-[80px] shrink-0 rounded-lg object-cover ring-1 ring-border sm:size-[96px]"
        />
      </Link>
      <div className="min-w-0 flex-1 space-y-1.5">
        <CategoryTag label={article.category} className="bg-brand-soft text-primary" />
        <Link to={`/news-details`} className="block">
          <h3 className="line-clamp-2 font-inter text-base font-semibold leading-[1.15] text-zbc-gray-1000 mb-2 hover:text-primary">
            {article.title}
          </h3>
        </Link>
        <ArticleMeta
          author={article.author}
          readTime={article.readTime}
          views={article.views}
          hideViewsBelowSm={hideViewsBelowSm}
        />
      </div>
    </article>
  );
}
