import { GitCompareArrows, History, RotateCcw } from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { ActivityFileChip } from "@/components/admin/shared/ActivityFileChip";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { ActivityLogPageWrapper } from "@/components/admin/shared/ActivityLogPageWrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ActivityFileValue } from "@/services/admin/activityLogShared";
import {
  compareArticleRevisions,
  fetchArticleRevisions,
  restoreArticleRevision,
  type ArticleRevisionComparison,
  type ArticleRevisionListItem,
} from "@/services/admin/articleRevisions";

type LocationState = {
  articleTitle?: string;
};

function formatWhen(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isImageField(field: string): boolean {
  const normalized = field.toLowerCase();
  return (
    normalized === "featured_image" ||
    normalized === "open_graph_image" ||
    normalized === "poster_media" ||
    normalized.endsWith("_image")
  );
}

/** Legacy revision diffs may still store bare Cloudinary URLs — wrap them as file chips. */
function coerceFileValue(field: string, value: unknown): ActivityFileValue | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (typeof record.kind === "string" && typeof record.name === "string") {
      const kind =
        record.kind === "image" ||
        record.kind === "video" ||
        record.kind === "audio" ||
        record.kind === "file"
          ? record.kind
          : "file";
      return {
        kind,
        name: record.name,
        url: typeof record.url === "string" ? record.url : null,
        downloadUrl:
          typeof record.download_url === "string"
            ? record.download_url
            : typeof record.downloadUrl === "string"
              ? record.downloadUrl
              : null,
      };
    }
  }

  if (typeof value === "string" && value.trim() && isImageField(field)) {
    const path = value.split("?")[0] ?? value;
    const name = path.split("/").pop() || "Image";
    return { kind: "image", name, url: value, downloadUrl: value };
  }

  return null;
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "None";
  return String(value);
}

function renderCompareValue(field: string, value: unknown): ReactNode {
  const file = coerceFileValue(field, value);
  if (file) return <ActivityFileChip file={file} />;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-admin-label">None</span>;

    const files = value
      .map((entry) => coerceFileValue(field, entry))
      .filter((entry): entry is ActivityFileValue => entry !== null);

    if (files.length === value.length) {
      return (
        <div className="flex flex-col items-start gap-1.5">
          {files.map((entry, index) => (
            <ActivityFileChip key={`${entry.name}-${index}`} file={entry} />
          ))}
        </div>
      );
    }
  }

  return <>{formatScalar(value)}</>;
}

function eventLabel(event: string): string {
  return event
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminArticleRevisions() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const location = useLocation();
  const locationState = (location.state ?? {}) as LocationState;

  const [revisions, setRevisions] = React.useState<ArticleRevisionListItem[]>([]);
  const [articleTitle, setArticleTitle] = React.useState(locationState.articleTitle ?? "");
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(15);

  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [compareLeftId, setCompareLeftId] = React.useState<number | null>(null);
  const [compareRightId, setCompareRightId] = React.useState<number | null>(null);
  const [comparison, setComparison] = React.useState<ArticleRevisionComparison | null>(null);
  const [comparing, setComparing] = React.useState(false);

  const [pendingRestore, setPendingRestore] = React.useState<ArticleRevisionListItem | null>(
    null,
  );
  const [restoring, setRestoring] = React.useState(false);

  const decodedSlug = articleSlug ? decodeURIComponent(articleSlug) : "";

  const loadRevisions = React.useCallback(async () => {
    if (!decodedSlug) return;

    try {
      setLoading(true);
      const result = await fetchArticleRevisions(decodedSlug, page);
      setRevisions(result.revisions);
      setArticleTitle(locationState.articleTitle || result.articleTitle || decodedSlug);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setPageSize(result.pageSize);

      if (result.revisions.length > 0) {
        setSelectedId((current) => current ?? result.revisions[0].id);
        setCompareLeftId((current) => {
          if (current != null) return current;
          return result.revisions.length > 1 ? result.revisions[1].id : result.revisions[0].id;
        });
        setCompareRightId((current) => current ?? result.revisions[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch article revisions:", error);
      toast.error("Failed to load revision history");
      setRevisions([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [decodedSlug, locationState.articleTitle, page]);

  React.useEffect(() => {
    void loadRevisions();
  }, [loadRevisions]);

  const runCompare = React.useCallback(async () => {
    if (!decodedSlug || compareLeftId == null) return;

    try {
      setComparing(true);
      const result = await compareArticleRevisions(
        decodedSlug,
        compareLeftId,
        compareRightId,
      );
      setComparison(result);
    } catch (error) {
      console.error("Failed to compare revisions:", error);
      toast.error("Failed to compare revisions");
      setComparison(null);
    } finally {
      setComparing(false);
    }
  }, [compareLeftId, compareRightId, decodedSlug]);

  React.useEffect(() => {
    if (compareLeftId != null) {
      void runCompare();
    }
  }, [compareLeftId, compareRightId, runCompare]);

  const handleRestore = async () => {
    if (!decodedSlug || !pendingRestore) return;

    try {
      setRestoring(true);
      await restoreArticleRevision(decodedSlug, pendingRestore.id);
      toast.success(`Restored version ${pendingRestore.version}`);
      setPendingRestore(null);
      setComparison(null);
      setSelectedId(null);
      setCompareLeftId(null);
      setCompareRightId(null);
      if (page !== 1) {
        setPage(1);
      } else {
        await loadRevisions();
      }
    } catch (error) {
      console.error("Failed to restore revision:", error);
      toast.error("Failed to restore revision");
    } finally {
      setRestoring(false);
    }
  };

  if (!decodedSlug) {
    return <Navigate to="/admin/articles" replace />;
  }

  const changeRows = comparison
    ? [
        ...new Set([
          ...Object.keys(comparison.changes.old),
          ...Object.keys(comparison.changes.new),
        ]),
      ].map((field) => ({
        field,
        oldValue: renderCompareValue(field, comparison.changes.old[field]),
        newValue: renderCompareValue(field, comparison.changes.new[field]),
      }))
    : [];

  return (
    <>
      <ActivityLogPageWrapper
        title="Article Revision History"
        subtitle={articleTitle || decodedSlug}
        meta={
          <>
            Slug: <span className="font-mono text-admin-heading">{decodedSlug}</span>
            <span className="mx-2 text-admin-trend-muted">•</span>
            Manual saves are versioned. Auto-saves are not.
          </>
        }
        backTo="/admin/articles"
        backLabel="Back to Articles"
        headerIcon={History}
        emptyIcon={History}
        loading={loading}
        isEmpty={revisions.length === 0}
        emptyTitle="No revisions yet"
        emptyDescription="Manual saves of this article will appear here as restoreable versions."
        pagination={
          totalItems > 0 ? (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          ) : null
        }
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          <div className="border-b border-border lg:border-r lg:border-b-0">
            <div className="border-b border-border px-4 py-3 text-xs font-semibold tracking-wide text-admin-label uppercase">
              Versions
            </div>
            <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto">
              {revisions.map((revision) => {
                const active = revision.id === selectedId;
                return (
                  <li key={revision.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(revision.id);
                        setCompareLeftId(revision.id);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors",
                        active ? "bg-muted/60" : "hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-admin-heading">
                          Version {revision.version}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-admin-label">
                          {eventLabel(revision.event)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-admin-label">
                        {formatWhen(revision.createdAt)} · {revision.createdBy}
                      </p>
                      {revision.changedFields.length > 0 ? (
                        <p className="mt-1 line-clamp-2 text-xs text-admin-trend-muted">
                          Changed: {revision.changedFields.slice(0, 6).map(formatFieldLabel).join(", ")}
                          {revision.changedFields.length > 6
                            ? ` +${revision.changedFields.length - 6}`
                            : ""}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="text-admin-label">Compare from</span>
                  <select
                    className="h-10 w-full rounded-[10px] border border-border bg-background px-3 text-sm text-admin-heading"
                    value={compareLeftId ?? ""}
                    onChange={(event) =>
                      setCompareLeftId(event.target.value ? Number(event.target.value) : null)
                    }
                  >
                    {revisions.map((revision) => (
                      <option key={revision.id} value={revision.id}>
                        Version {revision.version} · {formatWhen(revision.createdAt)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="text-admin-label">Compare to</span>
                  <select
                    className="h-10 w-full rounded-[10px] border border-border bg-background px-3 text-sm text-admin-heading"
                    value={compareRightId == null ? "current" : String(compareRightId)}
                    onChange={(event) =>
                      setCompareRightId(
                        event.target.value === "current"
                          ? null
                          : Number(event.target.value),
                      )
                    }
                  >
                    <option value="current">Current live article</option>
                    {revisions.map((revision) => (
                      <option key={revision.id} value={revision.id}>
                        Version {revision.version} · {formatWhen(revision.createdAt)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2"
                  disabled={comparing || compareLeftId == null}
                  onClick={() => void runCompare()}
                >
                  <GitCompareArrows className="size-4" aria-hidden />
                  Compare
                </Button>
                <Button
                  type="button"
                  className="h-10 gap-2"
                  disabled={!selectedId}
                  onClick={() => {
                    const revision = revisions.find((row) => row.id === selectedId) ?? null;
                    setPendingRestore(revision);
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Restore selected
                </Button>
              </div>
            </div>

            <div className="mt-5">
              {comparing ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : comparison ? (
                <>
                  <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-admin-label">{comparison.left.label}</p>
                      <p className="text-admin-heading">
                        {comparison.left.createdBy
                          ? `${comparison.left.createdBy} · ${formatWhen(comparison.left.createdAt ?? null)}`
                          : "Live article"}
                      </p>
                    </div>
                    <div>
                      <p className="text-admin-label">{comparison.right.label}</p>
                      <p className="text-admin-heading">
                        {comparison.right.createdBy
                          ? `${comparison.right.createdBy} · ${formatWhen(comparison.right.createdAt ?? null)}`
                          : "Live article"}
                      </p>
                    </div>
                  </div>

                  {changeRows.length === 0 ? (
                    <p className="rounded-[10px] border border-border bg-muted/30 px-4 py-8 text-center text-sm text-admin-label">
                      No differences between these versions.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-[10px] border border-border">
                      <table className="w-full min-w-140 border-collapse text-left text-sm">
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
                              className="border-b border-border bg-amber-50/50 last:border-b-0 dark:bg-amber-950/10"
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
                  )}
                </>
              ) : (
                <p className="rounded-[10px] border border-border bg-muted/30 px-4 py-8 text-center text-sm text-admin-label">
                  Select two versions to compare old → new values.
                </p>
              )}
            </div>
          </div>
        </div>
      </ActivityLogPageWrapper>

      <Dialog
        open={pendingRestore != null}
        onOpenChange={(open) => {
          if (!open && !restoring) setPendingRestore(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version {pendingRestore?.version}?</DialogTitle>
            <DialogDescription>
              The current live article will be saved as a new revision first, then replaced with
              version {pendingRestore?.version}. You can undo by restoring that newer revision.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={restoring}
              onClick={() => setPendingRestore(null)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={restoring} onClick={() => void handleRestore()}>
              {restoring ? "Restoring…" : "Restore version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
