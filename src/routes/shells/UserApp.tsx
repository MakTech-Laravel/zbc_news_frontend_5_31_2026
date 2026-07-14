import { Navigate, Route, Routes } from "react-router-dom";

import { UserLayout } from "@/layouts/user/UserLayout";
import { ClientOnly, FullPageSpinner } from "@/routes/ClientOnly";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { lazyWithRetry } from "@/routes/lazyWithRetry";
import { suspensePage } from "@/routes/routeUtils";

const UserDashboard = lazyWithRetry(() => import("@/pages/user/UserDashboard"));
const UserSavedArticles = lazyWithRetry(() => import("@/pages/user/UserSavedArticles"));
const UserProfile = lazyWithRetry(() => import("@/pages/user/UserProfile"));
const UserNotifications = lazyWithRetry(() => import("@/pages/user/UserNotifications"));
const UserMembership = lazyWithRetry(() => import("@/pages/user/UserMembership"));
const UserReadingAnalytics = lazyWithRetry(() => import("@/pages/user/UserReadingAnalytics"));
const UserBreakingNews = lazyWithRetry(() => import("@/pages/user/UserBreakingNews"));
const UserWorld = lazyWithRetry(() => import("@/pages/user/UserWorld"));
const UserEditorial = lazyWithRetry(() => import("@/pages/user/UserEditorial"));
const UserLongReads = lazyWithRetry(() => import("@/pages/user/UserLongReads"));

/** Client-only user subtree — kept exactly as the pre-SSR router (out of scope). */
function UserRoutes() {
  return (
    <ProtectedRoute roles="user">
      <Routes>
        <Route element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={suspensePage(UserDashboard)} />
          <Route path="saved-articles" element={suspensePage(UserSavedArticles)} />
          <Route path="profile" element={suspensePage(UserProfile)} />
          <Route path="notifications" element={suspensePage(UserNotifications)} />
          <Route path="membership" element={suspensePage(UserMembership)} />
          <Route path="reading-analytics" element={suspensePage(UserReadingAnalytics)} />
          <Route path="breaking-news" element={suspensePage(UserBreakingNews)} />
          <Route path="world" element={suspensePage(UserWorld)} />
          <Route path="editorial" element={suspensePage(UserEditorial)} />
          <Route path="long-reads" element={suspensePage(UserLongReads)} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}

export default function UserApp() {
  return (
    <ClientOnly fallback={<FullPageSpinner />}>
      <UserRoutes />
    </ClientOnly>
  );
}
