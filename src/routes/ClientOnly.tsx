import * as React from "react";

/**
 * Renders children only after client-side mount. On the server (and the first
 * hydration pass) it renders `fallback`, so any subtree that assumes a browser
 * environment never executes during SSR. Used to keep the out-of-scope
 * admin/user/auth trees client-rendered exactly as before, without SSR risk.
 */
const emptySubscribe = () => () => {};

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // true on the server / during the first hydration pass, false once mounted.
  const isServer = React.useSyncExternalStore(
    emptySubscribe,
    () => false,
    () => true,
  );

  return <>{isServer ? fallback : children}</>;
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
