import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";

import { ArticleListItem } from "./ArticleListItem";

type LatestStoriesProps = {
  articles: Article[];
  className?: string;
};

export function LatestStories({ articles, className }: LatestStoriesProps) {
  return (
    <section
      aria-labelledby="latest-stories-heading"
      className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}
    >
      <div className="border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="font-inter text-xl font-bold leading-[1.15] text-zbc-gray-1000 sm:leading-tight lg:text-2xl">
          Latest Stories
        </h2>
      </div>
      <div className="divide-y divide-border px-4 sm:px-5">
        {articles.map((article) => (
          <ArticleListItem key={article.id} article={article} hideViewsBelowSm />
        ))}
      </div>
    </section>
  );
}
