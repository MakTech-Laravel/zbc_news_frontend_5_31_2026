import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

import { formatViewCount, type LongReadArticle } from "@/types/longReads";
import { cn } from "@/lib/utils";

type LongReadArticleCardProps = {
  article: LongReadArticle;
  featured?: boolean;
  className?: string;
};

export function LongReadArticleCard({ article, featured = false, className }: LongReadArticleCardProps) {
  const articleHref = article.slug
    ? `/news-details/${encodeURIComponent(article.slug)}`
    : "/news-details";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[14px] border border-black/10 bg-white transition-shadow hover:shadow-md",
        featured ? "flex flex-col sm:flex-row" : "flex flex-col",
        className,
      )}
    >
      {article.imageUrl ? (
        <div
          className={cn(
            "shrink-0 overflow-hidden bg-zbc-gray-900",
            featured ? "h-48 w-full sm:h-auto sm:w-72" : "h-44 w-full",
          )}
        >
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className={cn("flex flex-1 flex-col p-6", featured && "justify-center")}>
        <span className="inline-flex w-fit rounded-lg bg-[#ECEEF2] px-2.5 py-0.5 font-inter text-xs font-medium text-[#030213]">
          {article.category}
        </span>

        <Link to={articleHref} className="mt-3 block">
          <h2
            className={cn(
              "font-inter font-semibold leading-snug text-ink-heading transition-colors group-hover:text-user-long-read",
              featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
            )}
          >
            {article.title}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-3 font-inter text-base leading-6 text-ink-muted">
          {article.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span className="font-inter">{article.author}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 font-inter">
              <Clock className="size-4 shrink-0" aria-hidden />
              {article.readTime}
            </span>
          </div>
          <span className="rounded-lg border border-black/10 px-2.5 py-0.5 font-inter text-xs font-medium text-ink-heading">
            {formatViewCount(article.views)}
          </span>
        </div>
      </div>
    </article>
  );
}
