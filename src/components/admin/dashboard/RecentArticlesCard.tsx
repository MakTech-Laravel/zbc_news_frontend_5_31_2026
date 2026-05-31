import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";

type RecentArticle = {
  title: string;
  status: AdminBadgeVariant;
  statusLabel: string;
  timeAgo: string;
};

const RECENT_ARTICLES: RecentArticle[] = [
  {
    title: "Global Climate Summit Reaches Historic Agreement",
    status: "published",
    statusLabel: "Published",
    timeAgo: "2 hours ago",
  },
  {
    title: "Tech Giant Announces Breakthrough in AI Technology",
    status: "published",
    statusLabel: "Published",
    timeAgo: "5 hours ago",
  },
  {
    title: "Major Sports Championship Final Results",
    status: "draft",
    statusLabel: "Draft",
    timeAgo: "1 day ago",
  },
];

export function RecentArticlesCard() {
  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Recent Articles</h2>

      <ul className="mt-4 space-y-3">
        {RECENT_ARTICLES.map((article, index) => (
          <li
            key={article.title}
            className={
              index < RECENT_ARTICLES.length - 1
                ? "border-b border-admin-list-divider pb-3"
                : undefined
            }
          >
            <p className="text-sm font-medium text-admin-heading">{article.title}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <AdminStatusBadge variant={article.status}>{article.statusLabel}</AdminStatusBadge>
              <span className="text-xs text-admin-trend-muted">{article.timeAgo}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
