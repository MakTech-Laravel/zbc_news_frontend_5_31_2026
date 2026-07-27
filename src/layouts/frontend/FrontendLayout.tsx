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

export function FrontendLayout({
  headerVariant,
}: {
  /** Optional override; otherwise uses Admin → Settings → Header Layout */
  headerVariant?: FrontendHeaderVariant;
}) {
  const { settings } = useSiteSettings();
  const variant = resolveHeaderVariant(
    headerVariant ?? settings.headerLayout,
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <FrontendHeader variant={variant} />
      <main className="mx-auto w-full flex-1">
        <Outlet />
      </main>
      <FrontendFooter />
    </div>
  );
}
