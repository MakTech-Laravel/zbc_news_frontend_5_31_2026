import { Link } from "react-router-dom";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import { ArticleMeta } from "@/components/main-layout/shared/ArticleMeta";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  article: Article;
  className?: string;
};

export function ArticleCard({ article, className }: ArticleCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xs border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        to={article.slug ? `/news-details/${article.slug}` : "/news-details"}
        className="block"
      >
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            width={640}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-2 p-4">
          <CategoryTag label={article.category} className="bg-brand-soft text-primary" />
          <h3 className="line-clamp-2 font-inter text-lg font-bold text-zbc-gray-1000 hover:text-primary cursor-pointer">
            {article.title}
          </h3>
          <ArticleMeta
            author={article.author}
            readTime={article.readTime}
            views={article.views}
            publishedAt={article.publishedAt}
            publishedAtIso={article.publishedAtIso}
            updatedAtIso={article.updatedAtIso}
          />
        </div>
      </Link>
    </article>
  );
}
