import type { ReactNode } from "react";

import type { ActivityFieldValue } from "@/services/admin/activityLogShared";
import type { BaseActivity } from "@/services/admin/activityLogShared";
import { cn } from "@/lib/utils";

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isCategoryField(field: string): boolean {
  const normalized = field.toLowerCase();
  return (
    normalized === "category" ||
    normalized === "category_id" ||
    normalized === "categoryid" ||
    normalized.endsWith("_category_id")
  );
}

function resolveCategoryLabel(
  value: ActivityFieldValue,
  categoryLabels: Record<string, string>,
): string | null {
  if (value === null || value === undefined) return null;

  const key = String(value);
  if (categoryLabels[key]) return categoryLabels[key];

  return null;
}

function formatFieldValue(
  field: string,
  value: ActivityFieldValue,
  categoryLabels: Record<string, string> = {},
): string {
  if (value === null || value === undefined) return "—";

  if (isCategoryField(field)) {
    const categoryTitle = resolveCategoryLabel(value, categoryLabels);
    if (categoryTitle) return categoryTitle;
    if (typeof value === "string" && Number.isNaN(Number(value))) return value;
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }

  return String(value);
}

function getChangeRows(
  activity: BaseActivity,
  categoryLabels: Record<string, string>,
) {
  const oldValues = activity.oldValues ?? {};
  const newValues = activity.newValues ?? {};
  const keys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  return [...keys].map((field) => ({
    field,
    oldValue: formatFieldValue(field, oldValues[field] ?? null, categoryLabels),
    newValue: formatFieldValue(field, newValues[field] ?? null, categoryLabels),
    changed: oldValues[field] !== newValues[field],
  }));
}

function TagsList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-admin-heading"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export type RenderArticleActivityExtraOptions = {
  articleTitle?: string;
  articleSlug?: string | null;
  categoryLabels?: Record<string, string>;
};

export function renderArticleActivityExtra(
  activity: BaseActivity,
  options: RenderArticleActivityExtraOptions = {},
): ReactNode {
  const categoryLabels = options.categoryLabels ?? {};
  const changeRows = getChangeRows(activity, categoryLabels);
  const hasChanges = activity.oldValues !== null || activity.newValues !== null;

  return (
    <>
      {options.articleTitle ? (
        <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-admin-label">Article</span>
            <p className="font-medium text-admin-heading">{options.articleTitle}</p>
          </div>
          {options.articleSlug ? (
            <div>
              <span className="text-admin-label">Slug</span>
              <p className="font-mono text-admin-heading">/{options.articleSlug}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {activity.event ? (
          <div>
            <span className="text-admin-label">Event</span>
            <p className="font-medium text-admin-heading">{activity.event}</p>
          </div>
        ) : null}
        <div>
          <span className="text-admin-label">IP address</span>
          <p className="font-mono text-admin-heading">{activity.ipAddress}</p>
        </div>
        <div>
          <span className="text-admin-label">Activity ID</span>
          <p className="font-mono text-admin-heading">#{activity.id}</p>
        </div>
      </div>

      {activity.tags.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold tracking-wide text-admin-label uppercase">Tags</p>
          <TagsList tags={activity.tags} />
        </div>
      ) : null}

      {hasChanges && changeRows.length > 0 ? (
        <div className="mt-5 overflow-x-auto rounded-[10px] border border-border">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 font-semibold text-admin-heading">Field</th>
                <th className="px-4 py-3 font-semibold text-admin-heading">Old value</th>
                <th className="px-4 py-3 font-semibold text-admin-heading">New value</th>
              </tr>
            </thead>
            <tbody>
              {changeRows.map((row) => (
                <tr
                  key={row.field}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    row.changed && "bg-amber-50/50 dark:bg-amber-950/10",
                  )}
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap text-admin-heading">
                    {formatFieldLabel(row.field)}
                  </td>
                  <td className="px-4 py-3 text-admin-label">{row.oldValue}</td>
                  <td className="px-4 py-3 text-admin-heading">{row.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
