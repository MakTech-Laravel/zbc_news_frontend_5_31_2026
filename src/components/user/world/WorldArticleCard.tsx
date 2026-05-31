import { UserFeedArticleCard } from "@/components/user/dashboard/UserFeedArticleCard";
import type { UserFeedArticle } from "@/data/dummy/userDashboard";
import type { WorldFeedArticle } from "@/data/dummy/worldNews";

type WorldArticleCardProps = {
  article: WorldFeedArticle;
};

function toFeedArticle(article: WorldFeedArticle): UserFeedArticle {
  return {
    id: article.id,
    category: article.category,
    title: article.title,
    excerpt: article.excerpt,
    author: article.author,
    readTime: article.readTime,
    publishedAt: article.publishedAt,
  };
}

export function WorldArticleCard({ article }: WorldArticleCardProps) {
  return <UserFeedArticleCard article={toFeedArticle(article)} density="compact" />;
}
