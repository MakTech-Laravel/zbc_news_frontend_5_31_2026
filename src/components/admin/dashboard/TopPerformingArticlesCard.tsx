import { Eye, TrendingDown, TrendingUp } from "lucide-react";

import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";
import { cn } from "@/lib/utils";

type TopArticle = {
  rank: number;
  title: string;
  category: AdminBadgeVariant;
  categoryLabel: string;
  views: string;
  trend: "up" | "down";
};

const TOP_ARTICLES: TopArticle[] = [
  {
    rank: 1,
    title: "Global Climate Summit Reaches Historic Agreement",
    category: "politics",
    categoryLabel: "Politics",
    views: "125,400 views",
    trend: "up",
  },
  {
    rank: 2,
    title: "Tech Giant Announces Breakthrough in AI Technology",
    category: "technology",
    categoryLabel: "Technology",
    views: "98,200 views",
    trend: "up",
  },
  {
    rank: 3,
    title: "Major Sports Championship Final Results",
    category: "sports",
    categoryLabel: "Sports",
    views: "87,650 views",
    trend: "down",
  },
  {
    rank: 4,
    title: "Economic Policy Changes Impact Global Markets",
    category: "politics",
    categoryLabel: "Politics",
    views: "76,300 views",
    trend: "up",
  },
  {
    rank: 5,
    title: "Healthcare Reform Bill Passes Senate Vote",
    category: "politics",
    categoryLabel: "Politics",
    views: "64,100 views",
    trend: "up",
  },
];

export function TopPerformingArticlesCard() {
  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Top Performing Articles</h2>

      <ol className="mt-4 space-y-4">
        {TOP_ARTICLES.map((article, index) => {
          const TrendIcon = article.trend === "down" ? TrendingDown : TrendingUp;
          return (
            <li
              key={article.rank}
              className={cn(
                "flex gap-3",
                index < TOP_ARTICLES.length - 1 && "border-b border-admin-list-divider pb-4",
              )}
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-admin-rank-bg text-sm font-semibold text-admin-label">
                {article.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium leading-snug text-admin-heading">{article.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AdminStatusBadge variant={article.category}>{article.categoryLabel}</AdminStatusBadge>
                  <span className="inline-flex items-center gap-1 text-sm text-admin-label">
                    <Eye className="size-3.5" aria-hidden />
                    {article.views}
                  </span>
                </div>
              </div>
              <TrendIcon
                className={cn(
                  "size-5 shrink-0",
                  article.trend === "down" ? "text-admin-trend-down" : "text-admin-trend-up",
                )}
                aria-hidden
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
