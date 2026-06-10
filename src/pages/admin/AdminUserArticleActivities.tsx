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
  fetchUserArticleActivities,
  type UserArticleActivity,
} from "@/services/admin/userArticleActivities";

type UserArticleActivitiesLocationState = {
  userName?: string;
  userEmail?: string;
};

export default function AdminUserArticleActivities() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const locationState = (location.state ?? {}) as UserArticleActivitiesLocationState;

  const [activities, setActivities] = React.useState<UserArticleActivity[]>([]);
  const [userName, setUserName] = React.useState(locationState.userName ?? "");
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(15);
  const categoryLabels = useActivityCategoryLabels();

  const loadActivities = React.useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const result = await fetchUserArticleActivities(userId, page);
      setActivities(result.activities);
      setUserName(locationState.userName || result.userName || `User #${userId}`);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setPageSize(result.pageSize);
    } catch (error) {
      console.error("Failed to fetch user article activities:", error);
      toast.error("Failed to load activity logs");
      setActivities([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [locationState.userName, page, userId]);

  React.useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  if (!userId) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <ActivityLogPageWrapper
      title="User Article Activity Logs"
      subtitle={userName}
      meta={
        locationState.userEmail ? (
          <>
            Email: <span className="text-admin-heading">{locationState.userEmail}</span>
          </>
        ) : (
          <>
            User ID: <span className="font-mono text-admin-heading">#{userId}</span>
          </>
        )
      }
      backTo="/admin/users"
      backLabel="Back to Users"
      headerIcon={History}
      emptyIcon={History}
      loading={loading}
      isEmpty={activities.length === 0}
      emptyTitle="No activity logs found"
      emptyDescription="Article activities performed by this user will appear here."
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
          renderArticleActivityExtra(activity, {
            articleTitle: activity.articleTitle,
            articleSlug: activity.articleSlug,
            categoryLabels,
          })
        }
      />
    </ActivityLogPageWrapper>
  );
}
