import { AnalyticsScripts } from "@/components/integrations/AnalyticsScripts";
import { useFavicon } from "@/hooks/useFavicon";
import { ClientOnly } from "@/routes/ClientOnly";

/** Client-side bootstrap effects (favicon + analytics), safe to mount in root. */
export function AppBootstrapEffects() {
  useFavicon({
    apiUrl: import.meta.env.VITE_FAVICON_API_URL as string | undefined,
    responsePath:
      (import.meta.env.VITE_FAVICON_RESPONSE_PATH as string | undefined) ?? "data.favicon",
    ttlMs: Number(import.meta.env.VITE_FAVICON_CACHE_TTL_MS || 0) || undefined,
  });

  return (
    <ClientOnly>
      <AnalyticsScripts />
    </ClientOnly>
  );
}
