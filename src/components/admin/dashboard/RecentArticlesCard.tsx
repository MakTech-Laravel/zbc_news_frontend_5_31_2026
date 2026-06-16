import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";
import type { AdminRecentArticle } from "@/services/admin/dashboard";

const FALLBACK: AdminRecentArticle[] = [
  { id: 1, title: "Global Climate Summit Reaches Historic Agreement", status: "published", statusLabel: "Published", timeAgo: "2 hours ago" },
  { id: 2, title: "Tech Giant Announces Breakthrough in AI Technology", status: "published", statusLabel: "Published", timeAgo: "5 hours ago" },
  { id: 3, title: "Major Sports Championship Final Results", status: "draft", statusLabel: "Draft", timeAgo: "1 day ago" },
];

type RecentArticlesCardProps = {
  articles?: AdminRecentArticle[];
  loading?: boolean;
};

export function RecentArticlesCard({ articles, loading = false }: RecentArticlesCardProps) {
  const displayArticles = articles ?? FALLBACK;

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Recent Articles</h2>

      {loading ? (
        <div className="mt-4 animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded bg-muted" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {displayArticles.map((article, index) => (
            <li
              key={article.id}
              className={
                index < displayArticles.length - 1
                  ? "border-b border-admin-list-divider pb-3"
                  : undefined
              }
            >
              <p className="text-sm font-medium text-admin-heading">{article.title}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <AdminStatusBadge variant={article.status as AdminBadgeVariant}>
                  {article.statusLabel}
                </AdminStatusBadge>
                <span className="text-xs text-admin-trend-muted">{article.timeAgo}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
