import { request } from "@/api/request";
import {
  mapPublicSiteSettings,
  type PublicSiteSettings,
  type SiteSettingsApi,
} from "@/types/siteSettings";

function extractPayload<T>(body: unknown): T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid API response");
  }
  const root = body as Record<string, unknown>;
  return (root.data ?? root) as T;
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const response = await request.get("/site-settings");
  const raw = extractPayload<SiteSettingsApi>(response.data);
  return mapPublicSiteSettings(raw);
}
