import type { ArticleStatus } from "@/data/admin/mockArticles";

export const ARTICLE_WORKFLOW_STATUSES: ArticleStatus[] = [
  "draft",
  "pending_review",
  "scheduled",
  "published",
  "archived",
];

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export function formatArticleLastSaved(iso: string | null | undefined): string {
  if (!iso) return "Not saved yet";

  const saved = new Date(iso);
  if (Number.isNaN(saved.getTime())) return "Not saved yet";

  const diffMs = Date.now() - saved.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "Saved just now";
  if (diffSec < 60) return `Saved ${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Saved ${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Saved ${diffHr}h ago`;

  return `Last saved ${saved.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function resolveStatusAfterPublish(
  scheduledAt: string,
  now = new Date(),
): "scheduled" | "published" {
  if (!scheduledAt.trim()) return "published";

  const scheduled = new Date(scheduledAt);
  if (Number.isNaN(scheduled.getTime())) return "published";

  return scheduled.getTime() > now.getTime() ? "scheduled" : "published";
}
