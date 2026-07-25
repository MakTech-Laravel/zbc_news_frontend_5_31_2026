import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { ClientOnly, FullPageSpinner } from "@/routes/ClientOnly";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { lazyWithRetry } from "@/routes/lazyWithRetry";
import { suspensePage } from "@/routes/routeUtils";

const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/AdminDashboard"));
const AdminArticles = lazyWithRetry(() => import("@/pages/admin/AdminArticles"));
const AdminArticlesCreate = lazyWithRetry(() => import("@/pages/admin/AdminArticlesCreate"));
const AdminArticlesEdit = lazyWithRetry(() => import("@/pages/admin/AdminArticlesEdit"));
const AdminArticlesTrash = lazyWithRetry(() => import("@/pages/admin/AdminArticlesTrash"));
const AdminArticleActivities = lazyWithRetry(() => import("@/pages/admin/AdminArticleActivities"));
const AdminBreakingNews = lazyWithRetry(() => import("@/pages/admin/AdminBreakingNews"));
const AdminUser = lazyWithRetry(() => import("@/pages/admin/AdminUser"));
const AdminUserArticleActivities = lazyWithRetry(
  () => import("@/pages/admin/AdminUserArticleActivities"),
);
const AdminCategories = lazyWithRetry(() => import("@/pages/admin/AdminCategories"));
const AdminMenus = lazyWithRetry(() => import("@/pages/admin/AdminMenus"));
const AdminMedia = lazyWithRetry(() => import("@/pages/admin/AdminMedia"));
const AdminMonetization = lazyWithRetry(() => import("@/pages/admin/AdminMonetization"));
const AdminNewsletters = lazyWithRetry(() => import("@/pages/admin/AdminNewsletters"));
const AdminAnnouncements = lazyWithRetry(() => import("@/pages/admin/AdminAnnouncements"));
const AdminNotifications = lazyWithRetry(() => import("@/pages/admin/AdminNotifications"));
const AdminComments = lazyWithRetry(() => import("@/pages/admin/AdminComments"));
const AdminContactMessages = lazyWithRetry(() => import("@/pages/admin/AdminContactMessages"));
const AdminContactMessageDetail = lazyWithRetry(
  () => import("@/pages/admin/AdminContactMessageDetail"),
);
const AdminSettings = lazyWithRetry(() => import("@/pages/admin/AdminSettings"));
const AdminSettingsSeoEdit = lazyWithRetry(() => import("@/pages/admin/AdminSettingsSeoEdit"));
const AdminProfile = lazyWithRetry(() => import("@/pages/admin/AdminProfile"));
const AdminRole = lazyWithRetry(() => import("@/pages/admin/AdminRole"));
const AdminRoleCreate = lazyWithRetry(() => import("@/pages/admin/AdminRoleCreate"));
const AdminRoleEdit = lazyWithRetry(() => import("@/pages/admin/AdminRoleEdit"));

/** Client-only admin subtree — kept exactly as the pre-SSR router (out of scope). */
function AdminRoutes() {
  return (
    <ProtectedRoute roles="admin">
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={suspensePage(AdminDashboard)} />
          <Route path="articles" element={suspensePage(AdminArticles)} />
          <Route path="articles/edit/:articleSlug" element={suspensePage(AdminArticlesEdit)} />
          <Route path="articles/trash" element={suspensePage(AdminArticlesTrash)} />
          <Route path="articles/:articleSlug/activities" element={suspensePage(AdminArticleActivities)} />
          <Route path="articles/create" element={suspensePage(AdminArticlesCreate)} />
          <Route path="breaking-news" element={suspensePage(AdminBreakingNews)} />
          <Route path="categories" element={suspensePage(AdminCategories)} />
          <Route path="menus" element={suspensePage(AdminMenus)} />
          <Route path="media" element={suspensePage(AdminMedia)} />
          <Route path="rabc" element={suspensePage(AdminRole)} />
          <Route path="rabc/create" element={suspensePage(AdminRoleCreate)} />
          <Route path="rabc/edit/:roleId" element={suspensePage(AdminRoleEdit)} />
          <Route path="users" element={suspensePage(AdminUser)} />
          <Route path="users/:userId/article-activities" element={suspensePage(AdminUserArticleActivities)} />
          <Route path="monetization" element={suspensePage(AdminMonetization)} />
          <Route path="newsletters" element={suspensePage(AdminNewsletters)} />
          <Route path="announcements" element={suspensePage(AdminAnnouncements)} />
          <Route path="notifications" element={suspensePage(AdminNotifications)} />
          <Route path="comments" element={suspensePage(AdminComments)} />
          <Route path="contact-messages" element={suspensePage(AdminContactMessages)} />
          <Route path="contact-messages/:id" element={suspensePage(AdminContactMessageDetail)} />
          <Route path="settings" element={suspensePage(AdminSettings)} />
          <Route path="settings/seo/:pageId" element={suspensePage(AdminSettingsSeoEdit)} />
          <Route path="profile" element={suspensePage(AdminProfile)} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}

export default function AdminApp() {
  return (
    <ClientOnly fallback={<FullPageSpinner />}>
      <AdminRoutes />
    </ClientOnly>
  );
}
