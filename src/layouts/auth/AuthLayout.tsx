import { Outlet } from "react-router-dom";

import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { FrontendFooter } from "@/components/partials/frontend/FrontendFooter";
import {
  FrontendHeader,
  type FrontendHeaderVariant,
} from "@/components/partials/frontend/FrontendHeader";

function resolveHeaderVariant(
  value: string | undefined,
  fallback?: FrontendHeaderVariant,
): FrontendHeaderVariant {
  if (value === "compact" || value === "stacked") return value;
  return fallback ?? "stacked";
}

export function AuthLayout({
  showHeader = true,
  showFooter = true,
  headerVariant,
}: {
  showHeader?: boolean;
  showFooter?: boolean;
  headerVariant?: FrontendHeaderVariant;
}) {
  const { settings } = useSiteSettings();
  const variant = resolveHeaderVariant(
    headerVariant ?? settings.headerLayout,
  );

  return (
    <div className="flex min-h-dvh flex-col bg-auth-bg">
      {showHeader ? <FrontendHeader variant={variant} /> : null}
      <main className="mx-auto flex w-full flex-1 container items-center justify-center px-4 py-12">
        <Outlet />
      </main>
      {showFooter ? <FrontendFooter /> : null}
    </div>
  );
}
