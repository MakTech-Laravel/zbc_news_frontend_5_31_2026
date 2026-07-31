import type { RouteObject } from "react-router-dom";
import { Navigate, useParams } from "react-router-dom";

import { FrontendLayout } from "@/layouts/frontend/FrontendLayout";
import { MainLayout } from "@/layouts/main/MainLayout";
import { suspensePage } from "@/routes/routeUtils";
import {
  AboutUs,
  AccessibilityStatement,
  Advertise,
  Careers,
  Contact,
  CookiePolicy,
  Home,
  Newsletter,
  CancelAccountDeletion,
  TagArticles,
  AuthorProfile,
  PrivacyPolicy,
  TermsOfService,
} from "./dynamicImport";

function LegacyArticleRedirect() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  return (
    <Navigate
      to={articleSlug ? `/${encodeURIComponent(articleSlug)}` : "/"}
      replace
    />
  );
}

export const publicRoutes: RouteObject = {
  element: <FrontendLayout />,
  children: [
    { path: "/about", element: suspensePage(AboutUs) },
    { path: "/contact", element: suspensePage(Contact) },
    { path: "/privacy", element: suspensePage(PrivacyPolicy) },
    { path: "/terms", element: suspensePage(TermsOfService) },
    { path: "/privacy-policy", element: <Navigate to="/privacy" replace /> },
    { path: "/terms-of-service", element: <Navigate to="/terms" replace /> },
    { path: "/cookie-policy", element: suspensePage(CookiePolicy) },
    { path: "/accessibility-statement", element: suspensePage(AccessibilityStatement) },
    { path: "/advertise", element: suspensePage(Advertise) },
    { path: "/careers", element: suspensePage(Careers) },
    { path: "/newsletter", element: suspensePage(Newsletter) },
    { path: "/account/cancel-deletion", element: suspensePage(CancelAccountDeletion) },
    {
      element: <MainLayout />,
      children: [
        { path: "/", element: suspensePage(Home) },
        { path: "/tag/:tagSlug", element: suspensePage(TagArticles) },
        { path: "/author/:authorSlug", element: suspensePage(AuthorProfile) },
        { path: "/news-details/:articleSlug", element: <LegacyArticleRedirect /> },
        { path: "/news-details", element: <Navigate to="/" replace /> },
        { path: "/:slug", element: suspensePage(Home) },
      ],
    },
  ],
};
