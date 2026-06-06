
import type { RouteObject } from "react-router-dom";

import { FrontendLayout } from "@/layouts/frontend/FrontendLayout";
import { MainLayout } from "@/layouts/main/MainLayout";
import { suspensePage } from "@/routes/routeUtils";
import { Home, NewsDetails } from "./dynamicImport";
// import { Test, Politics, Business, Entertainment, Technology, Sports, WorldNews, VideoMedia } from "./dynamicImport";


export const publicRoutes: RouteObject = {
  element: <FrontendLayout />,
  children: [
    {
      element: <MainLayout />,
      children: [
        { path: "/", element: suspensePage(Home) },
        { path: "/news-details/:articleSlug", element: suspensePage(NewsDetails) },
        { path: "/news-details", element: suspensePage(NewsDetails) },
        { path: "/:slug", element: suspensePage(Home) },
      ],
    },

  ],
};
