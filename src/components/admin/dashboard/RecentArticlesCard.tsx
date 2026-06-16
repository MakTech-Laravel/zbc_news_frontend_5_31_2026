import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";
import type { AdminRecentArticle } from "@/services/admin/dashboard";

type RecentArticlesCardProps = {
  articles?: AdminRecentArticle[];
};

export function RecentArticlesCard({ articles = [] }: RecentArticlesCardProps) {
  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Recent Articles</h2>

      <ul className="mt-4 space-y-3">
        {articles.map((article, index) => (
          <li
            key={article.id}
            className={
              index < articles.length - 1
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
    </section>
  );
}
