import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AdminBadgeVariant =
  | "published"
  | "draft"
  | "scheduled"
  | "pending_review"
  | "archived"
  | "politics"
  | "technology"
  | "sports";

const BADGE_STYLES: Record<AdminBadgeVariant, string> = {
  published: "bg-admin-badge-published-bg text-admin-badge-published-text",
  draft: "bg-admin-badge-draft-bg text-admin-badge-draft-text",
  scheduled: "bg-admin-badge-scheduled-bg text-admin-badge-scheduled-text",
  pending_review: "bg-admin-badge-pending-bg text-admin-badge-pending-text",
  archived: "bg-admin-badge-archived-bg text-admin-badge-archived-text",
  politics: "bg-admin-badge-politics-bg text-admin-badge-politics-text",
  technology: "bg-admin-badge-tech-bg text-admin-badge-tech-text",
  sports: "bg-admin-badge-sports-bg text-admin-badge-sports-text",
};

const STATUS_LABELS: Record<
  "published" | "draft" | "scheduled" | "pending_review" | "archived",
  string
> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
  pending_review: "Pending Review",
  archived: "Archived",
};

type AdminStatusBadgeProps = {
  variant: AdminBadgeVariant;
  children?: ReactNode;
  className?: string;
};

export function AdminStatusBadge({ variant, children, className }: AdminStatusBadgeProps) {
  const label =
    children ??
    (variant in STATUS_LABELS
      ? STATUS_LABELS[variant as keyof typeof STATUS_LABELS]
      : null);

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded px-2 text-xs leading-4",
        BADGE_STYLES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
