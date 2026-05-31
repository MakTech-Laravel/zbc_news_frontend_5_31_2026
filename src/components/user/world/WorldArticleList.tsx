import { WorldArticleCard } from "@/components/user/world/WorldArticleCard";
import type { WorldFeedArticle } from "@/data/dummy/worldNews";
import { cn } from "@/lib/utils";

type WorldArticleListProps = {
  articles: WorldFeedArticle[];
  className?: string;
};

export function WorldArticleList({ articles, className }: WorldArticleListProps) {
  if (articles.length === 0) {
    return (
      <p
        className={cn(
          "rounded-[14px] border border-dashed border-border-light bg-white p-8 text-center font-inter text-sm text-ink-muted",
          className,
        )}
      >
        No articles in this region yet.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} role="feed" aria-label="World news articles">
      {articles.map((article) => (
        <WorldArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
