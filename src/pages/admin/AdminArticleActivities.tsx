import { History } from "lucide-react";
import * as React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { ActivityLogPageWrapper } from "@/components/admin/shared/ActivityLogPageWrapper";
import { ActivityLogTable } from "@/components/admin/shared/ActivityLogTable";
import { cn } from "@/lib/utils";
import {
  type ActivityFieldValue,
  fetchArticleActivities,
  type ArticleActivity,
} from "@/services/admin/articleActivities";

type ArticleActivitiesLocationState = {
  articleTitle?: string;
};

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFieldValue(value: ActivityFieldValue): string {
  if (value === null || value === undefined) return "—";

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

function getChangeRows(activity: ArticleActivity) {
  const oldValues = activity.oldValues ?? {};
  const newValues = activity.newValues ?? {};
  const keys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  return [...keys].map((field) => ({
    field,
    oldValue: formatFieldValue(oldValues[field] ?? null),
    newValue: formatFieldValue(newValues[field] ?? null),
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

function renderArticleActivityExtra(activity: ArticleActivity) {
  const changeRows = getChangeRows(activity);
  const hasChanges = activity.oldValues !== null || activity.newValues !== null;

  return (
    <>
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

export default function AdminArticleActivities() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const location = useLocation();
  const locationState = (location.state ?? {}) as ArticleActivitiesLocationState;

  const [activities, setActivities] = React.useState<ArticleActivity[]>([]);
  const [articleTitle, setArticleTitle] = React.useState(locationState.articleTitle ?? "");
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(15);

  const decodedSlug = articleSlug ? decodeURIComponent(articleSlug) : "";

  const loadActivities = React.useCallback(async () => {
    if (!decodedSlug) return;

    try {
      setLoading(true);
      const result = await fetchArticleActivities(decodedSlug, page);
      setActivities(result.activities);
      setArticleTitle(locationState.articleTitle || result.articleTitle || decodedSlug);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setPageSize(result.pageSize);
    } catch (error) {
      console.error("Failed to fetch article activities:", error);
      toast.error("Failed to load activity logs");
      setActivities([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [decodedSlug, locationState.articleTitle, page]);

  React.useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  if (!decodedSlug) {
    return <Navigate to="/admin/articles" replace />;
  }

  return (
    <ActivityLogPageWrapper
      title="Article Activity Logs"
      subtitle={articleTitle || decodedSlug}
      meta={
        <>
          Slug: <span className="font-mono text-admin-heading">{decodedSlug}</span>
        </>
      }
      backTo="/admin/articles"
      backLabel="Back to Articles"
      headerIcon={History}
      emptyIcon={History}
      loading={loading}
      isEmpty={activities.length === 0}
      emptyTitle="No activity logs found"
      emptyDescription="Changes to this article will appear here."
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
      <ActivityLogTable logs={activities} renderExtra={renderArticleActivityExtra} />
    </ActivityLogPageWrapper>
  );
}
