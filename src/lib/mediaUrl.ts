import { getApiWebOrigin, isInternalServiceHostname } from "@/lib/appOrigins";

/**
 * Turn API storage / attachment paths into absolute URLs on the public API host.
 * Rewrites Docker-internal absolute URLs (e.g. http://backend/api/...) that SSR
 * may produce when INTERNAL_API_BASE_URL is used for server-side fetches.
 */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path?.trim()) return "";
  const trimmed = path.trim();
  const origin = getApiWebOrigin();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (isInternalServiceHostname(parsed.hostname)) {
        if (origin) {
          return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        // Drop unreachable host — keep path so a later pass / relative resolve can help
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      // fall through — return as-is
    }
    return trimmed;
  }

  // Scheme-less "backend/api/..." (browser treats "backend" as the host)
  if (/^[a-z0-9-]+\/api\//i.test(trimmed)) {
    const slash = trimmed.indexOf("/");
    const host = trimmed.slice(0, slash);
    if (isInternalServiceHostname(host)) {
      const rest = trimmed.slice(slash);
      return origin ? `${origin}${rest}` : rest;
    }
  }

  if (!origin) return trimmed;

  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}

/** Build public proxy URLs for article document view/download. */
export function resolveArticleAttachmentUrls(
  articleSlug: string,
  uuid: string,
): { url: string; downloadUrl: string } {
  const base = `/api/v1/articles/${encodeURIComponent(articleSlug)}/attachments/${encodeURIComponent(uuid)}`;
  return {
    url: resolveMediaUrl(`${base}?disposition=inline`),
    downloadUrl: resolveMediaUrl(`${base}?disposition=attachment`),
  };
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
