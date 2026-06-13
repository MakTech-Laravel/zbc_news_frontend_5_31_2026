import { LongReadArticleCard } from "@/components/user/long-reads/LongReadArticleCard";
import type { LongReadArticle } from "@/types/longReads";
import { cn } from "@/lib/utils";

type LongReadsArticleListProps = {
  articles: LongReadArticle[];
  className?: string;
};

export function LongReadsArticleList({ articles, className }: LongReadsArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-border-light bg-white p-8 text-center font-inter text-sm text-ink-muted">
        No stories match this filter yet.
      </p>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <div className={cn("flex flex-col gap-4", className)} role="feed" aria-label="Long read articles">
      {featured ? <LongReadArticleCard article={featured} featured /> : null}
      {rest.map((article) => (
        <LongReadArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
