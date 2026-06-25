import { Suspense, useEffect, type ComponentType, type LazyExoticComponent } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useRouteDocumentHead } from "@/hooks/useDocumentHead";

const pageFallback = (
  <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
    Loading…
  </div>
);

export function suspensePage(Comp: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense fallback={pageFallback}>
      <Comp />
    </Suspense>
  );
}

export function ScrollToTopLayout() {
  const { pathname } = useLocation();
  useRouteDocumentHead();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return <Outlet />;
}
