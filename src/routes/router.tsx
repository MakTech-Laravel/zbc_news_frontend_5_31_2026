import { Navigate, createBrowserRouter } from "react-router-dom";

import { RouteErrorFallback } from "@/components/error/RouteErrorFallback";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { lazyWithRetry } from "@/routes/lazyWithRetry";
import { authRoutes } from "@/routes/authRoutes";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { publicRoutes } from "@/routes/publicRoutes";
import { ScrollToTopLayout, suspensePage } from "@/routes/routeUtils";
import { UserLayout } from "@/layouts/user/UserLayout";
import NewDemo from "@/pages/demo/NewDemo";

const WebSocketTest = lazyWithRetry(() => import("@/pages/dev/WebSocketTest"));
const Unauthorized = lazyWithRetry(() => import("@/pages/global/Unauthorized"));
const NotFound = lazyWithRetry(() => import("@/pages/global/NotFound"));
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
const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/AdminDashboard"));
const AdminArticles = lazyWithRetry(() => import("@/pages/admin/AdminArticles"));
const AdminArticlesCreate = lazyWithRetry(() => import("@/pages/admin/AdminArticlesCreate"));
const AdminUser = lazyWithRetry(() => import("@/pages/admin/AdminUser"));
const AdminUserArticleActivities = lazyWithRetry(
  () => import("@/pages/admin/AdminUserArticleActivities"),
);
const AdminCategories = lazyWithRetry(() => import("@/pages/admin/AdminCategories"));
const AdminMedia = lazyWithRetry(() => import("@/pages/admin/AdminMedia"));
const AdminMonetization = lazyWithRetry(() => import("@/pages/admin/AdminMonetization"));
const AdminNewsletters = lazyWithRetry(() => import("@/pages/admin/AdminNewsletters"));
const AdminAnnouncements = lazyWithRetry(() => import("@/pages/admin/AdminAnnouncements"));
const AdminNotifications = lazyWithRetry(() => import("@/pages/admin/AdminNotifications"));
const NewsletterVerifyPage = lazyWithRetry(() => import("@/pages/newsletter/NewsletterVerifyPage"));
const NewsletterUnsubscribePage = lazyWithRetry(() => import("@/pages/newsletter/NewsletterUnsubscribePage"));
const NewsletterPreferencesPage = lazyWithRetry(() => import("@/pages/newsletter/NewsletterPreferencesPage"));
const AdminComments = lazyWithRetry(() => import("@/pages/admin/AdminComments"));
const AdminSettings = lazyWithRetry(() => import("@/pages/admin/AdminSettings"));
const AdminSettingsSeoEdit = lazyWithRetry(() => import("@/pages/admin/AdminSettingsSeoEdit"));
const AdminArticlesEdit = lazyWithRetry(() => import("@/pages/admin/AdminArticlesEdit"));
const AdminArticleActivities = lazyWithRetry(() => import("@/pages/admin/AdminArticleActivities"));
const AdminArticlesTrash = lazyWithRetry(() => import("@/pages/admin/AdminArticlesTrash"));
const AdminRole = lazyWithRetry(() => import("@/pages/admin/AdminRole"));
const AdminRoleCreate = lazyWithRetry(() => import("@/pages/admin/AdminRoleCreate"));
const AdminRoleEdit = lazyWithRetry(() => import("@/pages/admin/AdminRoleEdit"));


const redirect = (to: string) => <Navigate to={to} replace />;

export const router = createBrowserRouter([
  {
    element: <ScrollToTopLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      publicRoutes,

      authRoutes,
      
      { path: "/ws-test", element: suspensePage(WebSocketTest) },
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
            path: "announcements",
            element: suspensePage(AdminAnnouncements),
          },
          {
            path: "notifications",
            element: suspensePage(AdminNotifications),
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
  { path: "/demo/new", element: <NewDemo></NewDemo> },
]);
