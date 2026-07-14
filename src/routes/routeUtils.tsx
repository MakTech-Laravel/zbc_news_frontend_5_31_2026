import { Suspense, type ComponentType, type LazyExoticComponent } from "react";

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
