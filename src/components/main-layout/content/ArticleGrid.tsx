import type { Article } from "@/data/dummy/types";
import { cn } from "@/lib/utils";


import { ArticleCard } from "./ArticleCard";

type ArticleGridProps = {
  articles: Article[];
  title?: string;
  className?: string;
};

export function ArticleGrid({
  articles,
  className,
}: ArticleGridProps) {
  return (
    <section aria-labelledby="top-headlines-heading" className={cn(className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
