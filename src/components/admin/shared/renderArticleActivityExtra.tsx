import { Download, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import type { ReactNode } from "react";

import type {
  ActivityFieldValue,
  ActivityFileValue,
  BaseActivity,
} from "@/services/admin/activityLogShared";
import { isActivityFileValue } from "@/services/admin/activityLogShared";
import { resolveMediaUrl } from "@/lib/mediaUrl";
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
  value: string | number | boolean | null,
  categoryLabels: Record<string, string> = {},
): string {
  if (value === null || value === undefined) return "—";

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

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

const FILE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  file: FileText,
} as const;

/** Shows the actual image/document — thumbnail plus name — and downloads on click. */
function FileChip({ file }: { file: ActivityFileValue }) {
  const previewSrc = file.url ? resolveMediaUrl(file.url) : "";
  const downloadHref = resolveMediaUrl(file.downloadUrl ?? file.url);
  const Icon = FILE_ICONS[file.kind] ?? FileText;

  const body = (
    <>
      {file.kind === "image" && previewSrc ? (
        <img
          src={previewSrc}
          alt={file.name}
          loading="lazy"
          className="h-9 w-14 shrink-0 rounded-sm border border-border object-cover"
        />
      ) : (
        <Icon className="size-4 shrink-0" aria-hidden />
      )}
      <span className="truncate">{file.name}</span>
      {downloadHref ? <Download className="size-3.5 shrink-0 opacity-60" aria-hidden /> : null}
    </>
  );

  const className =
    "inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-admin-heading";

  if (!downloadHref) {
    return <span className={className}>{body}</span>;
  }

  return (
    <a
      href={downloadHref}
      download={file.name}
      className={cn(className, "transition-colors hover:border-primary hover:text-primary")}
      title={`Download ${file.name}`}
    >
      {body}
    </a>
  );
}

function renderFieldValue(
  field: string,
  value: ActivityFieldValue,
  categoryLabels: Record<string, string>,
): ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-admin-label">—</span>;
  }

  if (isActivityFileValue(value)) {
    return <FileChip file={value} />;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-admin-label">None</span>;

    if (isActivityFileValue(value[0])) {
      return (
        <div className="flex flex-col items-start gap-1.5">
          {(value as ActivityFileValue[]).map((file, index) => (
            <FileChip key={`${file.name}-${index}`} file={file} />
          ))}
        </div>
      );
    }

    return <>{(value as string[]).join(", ")}</>;
  }

  return <>{formatFieldValue(field, value, categoryLabels)}</>;
}

/** Mirrors the backend identity rule: attachments by name, media by URL. */
function fileIdentity(file: ActivityFileValue): string {
  return file.kind === "file" ? file.name : (file.url ?? file.name);
}

function valuesEqual(a: ActivityFieldValue, b: ActivityFieldValue): boolean {
  if (isActivityFileValue(a) || isActivityFileValue(b)) {
    if (!isActivityFileValue(a) || !isActivityFileValue(b)) return false;
    return a.kind === b.kind && fileIdentity(a) === fileIdentity(b);
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    const left = Array.isArray(a) ? a : [];
    const right = Array.isArray(b) ? b : [];
    return (
      left.length === right.length &&
      left.every((item, index) => valuesEqual(item, right[index]))
    );
  }

  return a === b;
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
    oldValue: renderFieldValue(field, oldValues[field] ?? null, categoryLabels),
    newValue: renderFieldValue(field, newValues[field] ?? null, categoryLabels),
    changed: !valuesEqual(oldValues[field] ?? null, newValues[field] ?? null),
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
        {activity.userAgent ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <span className="text-admin-label">Device</span>
            <p className="wrap-break-word text-admin-heading">{activity.userAgent}</p>
          </div>
        ) : null}
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
                  <td className="max-w-70 px-4 py-3 wrap-break-word text-admin-label">
                    {row.oldValue}
                  </td>
                  <td className="max-w-70 px-4 py-3 wrap-break-word text-admin-heading">
                    {row.newValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
