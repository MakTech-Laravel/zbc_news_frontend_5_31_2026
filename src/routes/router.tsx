import { lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { authRoutes } from "@/routes/authRoutes";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { publicRoutes } from "@/routes/publicRoutes";
import { ScrollToTopLayout, suspensePage } from "@/routes/routeUtils";
import { UserLayout } from "@/layouts/user/UserLayout";

const Unauthorized = lazy(() => import("@/pages/global/Unauthorized"));
const NotFound = lazy(() => import("@/pages/global/NotFound"));
const UserDashboard = lazy(() => import("@/pages/user/UserDashboard"));
const UserSavedArticles = lazy(() => import("@/pages/user/UserSavedArticles"));
const UserProfile = lazy(() => import("@/pages/user/UserProfile"));
const UserNotifications = lazy(() => import("@/pages/user/UserNotifications"));
const UserMembership = lazy(() => import("@/pages/user/UserMembership"));
const UserReadingAnalytics = lazy(() => import("@/pages/user/UserReadingAnalytics"));
const UserBreakingNews = lazy(() => import("@/pages/user/UserBreakingNews"));
const UserWorld = lazy(() => import("@/pages/user/UserWorld"));
const UserEditorial = lazy(() => import("@/pages/user/UserEditorial"));
const UserLongReads = lazy(() => import("@/pages/user/UserLongReads"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminArticles = lazy(() => import("@/pages/admin/AdminArticles"));
const AdminArticlesCreate = lazy(() => import("@/pages/admin/AdminArticlesCreate"));
const AdminUser = lazy(() => import("@/pages/admin/AdminUser"));
const AdminUserArticleActivities = lazy(
  () => import("@/pages/admin/AdminUserArticleActivities"),
);
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia"));
const AdminMonetization = lazy(() => import("@/pages/admin/AdminMonetization"));
const AdminNewsletters = lazy(() => import("@/pages/admin/AdminNewsletters"));
const NewsletterVerifyPage = lazy(() => import("@/pages/newsletter/NewsletterVerifyPage"));
const NewsletterUnsubscribePage = lazy(() => import("@/pages/newsletter/NewsletterUnsubscribePage"));
const NewsletterPreferencesPage = lazy(() => import("@/pages/newsletter/NewsletterPreferencesPage"));
const AdminComments = lazy(() => import("@/pages/admin/AdminComments"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminSettingsSeoEdit = lazy(() => import("@/pages/admin/AdminSettingsSeoEdit"));
const AdminArticlesEdit = lazy(() => import("@/pages/admin/AdminArticlesEdit"));
const AdminArticleActivities = lazy(() => import("@/pages/admin/AdminArticleActivities"));
const AdminArticlesTrash = lazy(() => import("@/pages/admin/AdminArticlesTrash"));
const AdminRole = lazy(() => import("@/pages/admin/AdminRole"));
const AdminRoleCreate = lazy(() => import("@/pages/admin/AdminRoleCreate"));
const AdminRoleEdit = lazy(() => import("@/pages/admin/AdminRoleEdit"));
const NewDemo = lazy(() => import("@/pages/demo/NewDemo"));

const redirect = (to: string) => <Navigate to={to} replace />;

export const router = createBrowserRouter([
  {
    element: <ScrollToTopLayout />,
    children: [
      publicRoutes,

      authRoutes,
      
      { path: "/unauthorized", element: suspensePage(Unauthorized) },
      { path: "/newsletter/verify", element: suspensePage(NewsletterVerifyPage) },
      { path: "/newsletter/unsubscribe", element: suspensePage(NewsletterUnsubscribePage) },
      { path: "/newsletter/preferences", element: suspensePage(NewsletterPreferencesPage) },
      { path: "/dashboard", element: redirect("/user/dashboard") },
      // { path: "/user/dashboard", element: <ProtectedRoute>{suspensePage(UserDashboard)}</ProtectedRoute> },
      {
        path: "/user",
        element: (
          <ProtectedRoute roles="user">
            <UserLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: redirect("/user/dashboard") },
          { path: "dashboard", element: suspensePage(UserDashboard) },
          { path: "saved-articles", element: suspensePage(UserSavedArticles) },
          { path: "profile", element: suspensePage(UserProfile) },
          { path: "notifications", element: suspensePage(UserNotifications) },
          { path: "membership", element: suspensePage(UserMembership) },
          { path: "reading-analytics", element: suspensePage(UserReadingAnalytics) },
          { path: "breaking-news", element: suspensePage(UserBreakingNews) },
          { path: "world", element: suspensePage(UserWorld) },
          { path: "editorial", element: suspensePage(UserEditorial) },
          { path: "long-reads", element: suspensePage(UserLongReads) },
        ],
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute roles="admin">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: redirect("/admin/dashboard") },
          {
            path: "dashboard",
            element: suspensePage(AdminDashboard),
          },
          {
            path: "articles",
            element: suspensePage(AdminArticles),
          },
          {
            path: "articles/edit/:articleSlug",
            element: suspensePage(AdminArticlesEdit),
          },
          {
            path: "articles/trash",
            element: suspensePage(AdminArticlesTrash),
          },
          {
            path: "articles/:articleSlug/activities",
            element: suspensePage(AdminArticleActivities),
          },
          {
            path: "articles/create",
            element: suspensePage(AdminArticlesCreate),
          },
          {
            path: "categories",
            element: suspensePage(AdminCategories),
          },
          {
            path: "media",
            element: suspensePage(AdminMedia),
          },
          {
            path: "rabc",
            element: suspensePage(AdminRole),
          },
          {
            path: "rabc/create",
            element: suspensePage(AdminRoleCreate),
          },
          {
            path: "rabc/edit/:roleId",
            element: suspensePage(AdminRoleEdit),
          },
          {
            path: "users",
            element: suspensePage(AdminUser),
          },
          {
            path: "users/:userId/article-activities",
            element: suspensePage(AdminUserArticleActivities),
          },
          {
            path: "monetization",
            element: suspensePage(AdminMonetization),
          },
          {
            path: "newsletters",
            element: suspensePage(AdminNewsletters),
          },
          {
            path: "comments",
            element: suspensePage(AdminComments),
          },
          {
            path: "settings",
            element: suspensePage(AdminSettings),
          },
          {
            path: "settings/seo/:pageId",
            element: suspensePage(AdminSettingsSeoEdit),
          },
        ],
      },
      { path: "*", element: suspensePage(NotFound) },
    ],
  },
  { path: "/demo/new", element: suspensePage(NewDemo) },
]);
