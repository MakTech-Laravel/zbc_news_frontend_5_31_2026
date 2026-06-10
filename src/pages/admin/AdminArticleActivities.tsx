import { History } from "lucide-react";
import * as React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { ActivityLogPageWrapper } from "@/components/admin/shared/ActivityLogPageWrapper";
import { ActivityLogTable } from "@/components/admin/shared/ActivityLogTable";
import { renderArticleActivityExtra } from "@/components/admin/shared/renderArticleActivityExtra";
import { useActivityCategoryLabels } from "@/components/admin/shared/useActivityCategoryLabels";
import {
  fetchArticleActivities,
  type ArticleActivity,
} from "@/services/admin/articleActivities";

type ArticleActivitiesLocationState = {
  articleTitle?: string;
};

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
  const categoryLabels = useActivityCategoryLabels();

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
      <ActivityLogTable
        logs={activities}
        renderExtra={(activity) =>
          renderArticleActivityExtra(activity, { categoryLabels })
        }
      />
    </ActivityLogPageWrapper>
  );
}
