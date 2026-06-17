import { env } from "@/config/env";

function getApiOrigin(): string {
  try {
    return new URL(env.apiBaseUrl).origin;
  } catch {
    return "";
  }
}

/** Turn API storage paths (`/storage/...`) into absolute URLs on the backend host. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path?.trim()) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const origin = getApiOrigin();
  if (!origin) return path;

  return path.startsWith("/") ? `${origin}${path}` : `${origin}/${path}`;
}

/** Resolve article image from API fields (featured, OG, legacy keys). */
export function resolveArticleImageUrl(raw: Record<string, unknown>): string {
  const candidates = [
    raw.featured_image_url,
    raw.featured_image,
    raw.open_graph_image,
    raw.image_url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return resolveMediaUrl(candidate);
    }
  }

  return "";
}
