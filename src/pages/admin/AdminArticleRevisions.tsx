import { ArrowRight, GitCompareArrows, History, RotateCcw } from "lucide-react";
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
        setSelectedId((current) => {
          if (current != null && result.revisions.some((row) => row.id === current)) {
            return current;
          }
          return result.revisions.length > 1
            ? result.revisions[1].id
            : result.revisions[0].id;
        });
        setCompareRightId((current) =>
          current != null && result.revisions.some((row) => row.id === current)
            ? current
            : null,
        );
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
    if (!decodedSlug || selectedId == null) return;

    try {
      setComparing(true);
      const result = await compareArticleRevisions(
        decodedSlug,
        selectedId,
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
  }, [selectedId, compareRightId, decodedSlug]);

  React.useEffect(() => {
    if (selectedId != null) {
      void runCompare();
    }
  }, [selectedId, compareRightId, runCompare]);

  const selectedRevision =
    revisions.find((row) => row.id === selectedId) ?? null;

  const handleRestore = async () => {
    if (!decodedSlug || !pendingRestore) return;

    try {
      setRestoring(true);
      const restored = await restoreArticleRevision(decodedSlug, pendingRestore.id);
      const restoredTitle = restored.title?.trim();
      toast.success(
        restoredTitle
          ? `Restored version ${pendingRestore.version}: “${restoredTitle}”`
          : `Restored version ${pendingRestore.version}`,
      );
      if (restoredTitle) {
        setArticleTitle(restoredTitle);
      }
      setPendingRestore(null);
      setComparison(null);
      setSelectedId(null);
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

  const compareAgainstLabel =
    compareRightId == null
      ? "Current live"
      : `Version ${revisions.find((row) => row.id === compareRightId)?.version ?? "—"}`;

  return (
    <>
      <ActivityLogPageWrapper
        title="Revision history"
        subtitle={articleTitle || decodedSlug}
        meta={
          <>
            <span className="font-mono text-admin-heading">/{decodedSlug}</span>
            <span className="mx-2 text-admin-trend-muted">·</span>
            Manual saves only · kept for 12 months
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
        <div className="grid min-h-140 gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Version timeline */}
          <aside className="border-b border-border lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-admin-label uppercase">
                Versions
              </p>
              <span className="text-xs tabular-nums text-admin-trend-muted">
                {totalItems}
              </span>
            </div>
            <ul className="max-h-[min(70vh,720px)] overflow-y-auto">
              {revisions.map((revision) => {
                const active = revision.id === selectedId;
                return (
                  <li key={revision.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(revision.id)}
                      className={cn(
                        "relative w-full border-b border-border/70 px-4 py-3.5 text-left transition-colors",
                        active
                          ? "bg-primary/6"
                          : "hover:bg-muted/40",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                        />
                      ) : null}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-semibold tabular-nums",
                                active ? "text-primary" : "text-admin-heading",
                              )}
                            >
                              v{revision.version}
                            </span>
                            <span className="truncate text-[11px] font-medium tracking-wide text-admin-label uppercase">
                              {eventLabel(revision.event)}
                            </span>
                          </div>
                          {revision.title ? (
                            <p className="mt-1 line-clamp-1 text-sm text-admin-heading">
                              {revision.title}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-admin-trend-muted">
                            {formatWhen(revision.createdAt)}
                            <span className="mx-1.5 text-border">·</span>
                            {revision.createdBy}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Detail + compare */}
          <section className="flex min-w-0 flex-col">
            {selectedRevision ? (
              <div className="flex flex-col gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-admin-label uppercase">
                    Selected version
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-admin-heading">
                    Version {selectedRevision.version}
                    {selectedRevision.title ? (
                      <span className="font-normal text-admin-label">
                        {" "}
                        · {selectedRevision.title}
                      </span>
                    ) : null}
                  </h2>
                  <p className="mt-0.5 text-sm text-admin-trend-muted">
                    {formatWhen(selectedRevision.createdAt)} · {selectedRevision.createdBy}
                    <span className="mx-1.5 text-border">·</span>
                    {eventLabel(selectedRevision.event)}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-10 shrink-0 gap-2"
                  onClick={() => setPendingRestore(selectedRevision)}
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Restore this version
                </Button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-xs font-semibold tabular-nums text-admin-heading">
                  v{selectedRevision?.version ?? "—"}
                </span>
                <ArrowRight
                  className="size-3.5 shrink-0 text-admin-trend-muted"
                  aria-hidden
                />
                <label className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-xs">
                  <span className="sr-only">Compare against</span>
                  <select
                    className="h-8 w-full min-w-45 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-admin-heading"
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
                    {revisions
                      .filter((revision) => revision.id !== selectedId)
                      .map((revision) => (
                        <option key={revision.id} value={revision.id}>
                          v{revision.version}
                          {revision.title ? ` — ${revision.title}` : ""}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center gap-2 text-xs text-admin-trend-muted">
                <GitCompareArrows className="size-3.5" aria-hidden />
                <span>
                  {changeRows.length}{" "}
                  {changeRows.length === 1 ? "difference" : "differences"}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 p-4 sm:p-6">
              {comparing ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : comparison ? (
                changeRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border px-4 py-16 text-center">
                    <GitCompareArrows
                      className="mb-3 size-8 text-admin-trend-muted"
                      aria-hidden
                    />
                    <p className="text-sm font-medium text-admin-heading">No differences</p>
                    <p className="mt-1 max-w-sm text-sm text-admin-label">
                      Version {selectedRevision?.version} matches {compareAgainstLabel.toLowerCase()}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[10px] border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-160 border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="w-[18%] px-4 py-3 text-xs font-semibold tracking-wide text-admin-label uppercase">
                              Field
                            </th>
                            <th className="w-[41%] px-4 py-3 text-xs font-semibold tracking-wide text-admin-label uppercase">
                              {comparison.left.label}
                            </th>
                            <th className="w-[41%] px-4 py-3 text-xs font-semibold tracking-wide text-admin-label uppercase">
                              {comparison.right.label}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {changeRows.map((row) => (
                            <tr
                              key={row.field}
                              className="border-b border-border bg-amber-50/70 last:border-b-0 dark:bg-amber-950/20"
                            >
                              <td className="border-l-2 border-l-amber-400 px-4 py-3.5 align-top font-medium whitespace-nowrap text-admin-heading dark:border-l-amber-500">
                                {formatFieldLabel(row.field)}
                              </td>
                              <td className="max-w-0 px-4 py-3.5 align-top wrap-break-word text-admin-label">
                                <span className="block rounded-md bg-red-50/80 px-2 py-1 dark:bg-red-950/30">
                                  {row.oldValue}
                                </span>
                              </td>
                              <td className="max-w-0 px-4 py-3.5 align-top wrap-break-word text-admin-heading">
                                <span className="block rounded-md bg-emerald-50/90 px-2 py-1 dark:bg-emerald-950/30">
                                  {row.newValue}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border px-4 py-16 text-center">
                  <p className="text-sm text-admin-label">
                    Select a version to compare against the live article.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </ActivityLogPageWrapper>

      <Dialog
        open={pendingRestore != null}
        onOpenChange={(open) => {
          if (!open && !restoring) setPendingRestore(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Restore version {pendingRestore?.version}?
            </DialogTitle>
            <DialogDescription className="space-y-3 text-left">
              <span className="block">
                Live content will be replaced with this snapshot. A new revision is saved first so
                you can undo.
              </span>
              {pendingRestore?.title ? (
                <span className="block rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-admin-heading">
                  {pendingRestore.title}
                </span>
              ) : null}
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
              {restoring ? "Restoring…" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
