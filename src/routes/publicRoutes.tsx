
import type { RouteObject } from "react-router-dom";

import { FrontendLayout } from "@/layouts/frontend/FrontendLayout";
import { MainLayout } from "@/layouts/main/MainLayout";
import { suspensePage } from "@/routes/routeUtils";
import { Home, Test, Politics, Business, Entertainment, Technology, Sports, WorldNews, VideoMedia, NewsDetails } from "./dynamicImport";


export const publicRoutes: RouteObject = {
  element: <FrontendLayout />,
  children: [
    {
      element: <MainLayout />,
      children: [
        { path: "/", element: suspensePage(Home) },
        { path: "/politics", element: suspensePage(Politics) },
        { path: "/business", element: suspensePage(Business) },
        { path: "/sports", element: suspensePage(Sports) },
        { path: "/entertainment", element: suspensePage(Entertainment) },
        { path: "/technology", element: suspensePage(Technology) },
        { path: "/world", element: suspensePage(WorldNews) },
        { path: "/video", element: suspensePage(VideoMedia) },
        { path: "/news-details", element: suspensePage(NewsDetails) },
        { path: "/test", element: suspensePage(Test) },
      ],
    },

  ],
};
