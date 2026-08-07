import { getApiWebOrigin, isPrivateHostname } from "@/lib/appOrigins";

/** Docker/K8s service names (no TLD) — not reachable from the public browser. */
function isInternalServiceHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  if (isPrivateHostname(host)) return true;
  // Single-label hosts like "backend", "api", "web" from compose networks
  return !host.includes(".");
}

/**
 * Turn API storage / attachment paths into absolute URLs on the public API host.
 * Rewrites Docker-internal absolute URLs (e.g. http://backend/api/...) that Laravel
 * `url()` may emit when the request Host is the internal service name.
 */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path?.trim()) return "";
  const trimmed = path.trim();
  const origin = getApiWebOrigin();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (origin && isInternalServiceHostname(parsed.hostname)) {
        return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      // fall through — return as-is
    }
    return trimmed;
  }

  // Scheme-less "backend/api/..." (browser treats "backend" as the host)
  if (origin && /^[a-z0-9-]+\/api\//i.test(trimmed)) {
    const slash = trimmed.indexOf("/");
    const host = trimmed.slice(0, slash);
    if (isInternalServiceHostname(host)) {
      return `${origin}${trimmed.slice(slash)}`;
    }
  }

  if (!origin) return trimmed;

  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
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
