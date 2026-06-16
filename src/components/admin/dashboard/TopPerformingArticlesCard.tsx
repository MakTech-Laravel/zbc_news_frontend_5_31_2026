import { Eye, TrendingDown, TrendingUp } from "lucide-react";

import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";
import { cn } from "@/lib/utils";
import type { AdminTopArticle } from "@/services/admin/dashboard";

const FALLBACK: AdminTopArticle[] = [
  { rank: 1, title: "Global Climate Summit Reaches Historic Agreement", category: "politics", categoryLabel: "Politics", views: 125400, trend: "up" },
  { rank: 2, title: "Tech Giant Announces Breakthrough in AI Technology", category: "technology", categoryLabel: "Technology", views: 98200, trend: "up" },
  { rank: 3, title: "Major Sports Championship Final Results", category: "sports", categoryLabel: "Sports", views: 87650, trend: "down" },
  { rank: 4, title: "Economic Policy Changes Impact Global Markets", category: "politics", categoryLabel: "Politics", views: 76300, trend: "up" },
  { rank: 5, title: "Healthcare Reform Bill Passes Senate Vote", category: "politics", categoryLabel: "Politics", views: 64100, trend: "up" },
];

type TopPerformingArticlesCardProps = {
  articles?: AdminTopArticle[];
  loading?: boolean;
};

export function TopPerformingArticlesCard({ articles, loading = false }: TopPerformingArticlesCardProps) {
  const displayArticles = articles ?? FALLBACK;

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Top Performing Articles</h2>

      {loading ? (
        <div className="mt-4 animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded bg-muted" />
          ))}
        </div>
      ) : (
        <ol className="mt-4 space-y-4">
          {displayArticles.map((article, index) => {
            const TrendIcon = article.trend === "down" ? TrendingDown : TrendingUp;
            const viewsLabel =
              typeof article.views === "number"
                ? article.views.toLocaleString() + " views"
                : article.views;
            return (
              <li
                key={article.rank}
                className={cn(
                  "flex gap-3",
                  index < displayArticles.length - 1 && "border-b border-admin-list-divider pb-4",
                )}
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-admin-rank-bg text-sm font-semibold text-admin-label">
                  {article.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-medium leading-snug text-admin-heading">{article.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <AdminStatusBadge variant={article.category as AdminBadgeVariant}>
                      {article.categoryLabel}
                    </AdminStatusBadge>
                    <span className="inline-flex items-center gap-1 text-sm text-admin-label">
                      <Eye className="size-3.5" aria-hidden />
                      {viewsLabel}
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
      )}
    </section>
  );
}
