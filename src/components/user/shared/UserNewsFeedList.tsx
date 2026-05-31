import { UserFeedArticleCard } from "@/components/user/dashboard/UserFeedArticleCard";
import type { UserFeedArticle } from "@/data/dummy/userDashboard";
import { cn } from "@/lib/utils";

type UserNewsFeedListProps = {
  articles: UserFeedArticle[];
  className?: string;
  title?: string;
};

export function UserNewsFeedList({ articles, className, title }: UserNewsFeedListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="font-inter text-xl font-semibold leading-8 text-ink-heading">{title}</h2>
      {articles.map((article) => (
        <UserFeedArticleCard key={article.id} article={article} density="compact" />
      ))}
    </div>
  );
}
