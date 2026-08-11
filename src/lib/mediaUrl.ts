import { getApiWebOrigin, isInternalServiceHostname } from "@/lib/appOrigins";

/**
 * Strip Cloudinary transformation segments (c_fill, g_auto, f_auto, …) that 404
 * on live for some assets, leaving the original delivery URL.
 */
export function preferOriginalCloudinaryUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || !trimmed.includes("/upload/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const marker = "/upload/";
    const path = parsed.pathname;
    const pos = path.indexOf(marker);
    if (pos < 0) return trimmed;

    const prefix = path.slice(0, pos + marker.length);
    const rest = path.slice(pos + marker.length);
    const segments = rest.split("/").filter(Boolean);
    const kept: string[] = [];
    let pastTransforms = false;

    for (const segment of segments) {
      if (!pastTransforms) {
        if (/^v\d+$/.test(segment)) {
          pastTransforms = true;
          kept.push(segment);
          continue;
        }

        if (
          segment.includes(",") ||
          /^(c_|w_|h_|f_|g_|q_|fl_|e_|dpr_|ar_|b_|bo_|r_|t_|x_|y_|z_|a_|u_|o_)/.test(
            segment,
          )
        ) {
          continue;
        }

        pastTransforms = true;
      }

      kept.push(segment);
    }

    if (kept.length === 0) return trimmed;

    parsed.pathname = `${prefix}${kept.join("/")}`;
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

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
          return preferOriginalCloudinaryUrl(
            `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`,
          );
        }
        // Drop unreachable host — keep path so a later pass / relative resolve can help
        return preferOriginalCloudinaryUrl(
          `${parsed.pathname}${parsed.search}${parsed.hash}`,
        );
      }
    } catch {
      // fall through — return as-is
    }
    return preferOriginalCloudinaryUrl(trimmed);
  }

  // Scheme-less "backend/api/..." (browser treats "backend" as the host)
  if (/^[a-z0-9-]+\/api\//i.test(trimmed)) {
    const slash = trimmed.indexOf("/");
    const host = trimmed.slice(0, slash);
    if (isInternalServiceHostname(host)) {
      const rest = trimmed.slice(slash);
      return preferOriginalCloudinaryUrl(origin ? `${origin}${rest}` : rest);
    }
  }

  if (!origin) return preferOriginalCloudinaryUrl(trimmed);

  const absolute = trimmed.startsWith("/")
    ? `${origin}${trimmed}`
    : `${origin}/${trimmed}`;
  return preferOriginalCloudinaryUrl(absolute);
}

/**
 * Rewrite src/poster attributes in article HTML so embedded media uses original CDN URLs.
 */
export function rewriteHtmlMediaUrls(html: string): string {
  if (!html) return html;

  return html.replace(
    /\b(src|poster)=(["'])([^"']+)\2/gi,
    (_match, attr: string, quote: string, url: string) => {
      const fixed = resolveMediaUrl(url) || url;
      return `${attr}=${quote}${fixed}${quote}`;
    },
  );
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

/** Resolve article image from API fields (featured, OG, legacy keys + featured_media). */
export function resolveArticleImageUrl(raw: Record<string, unknown>): string {
  const featuredMedia =
    raw.featured_media && typeof raw.featured_media === "object"
      ? (raw.featured_media as Record<string, unknown>)
      : null;

  if (featuredMedia) {
    const type = typeof featuredMedia.type === "string" ? featuredMedia.type : "image";
    const url =
      typeof featuredMedia.url === "string" ? featuredMedia.url.trim() : "";
    const poster =
      typeof featuredMedia.poster_url === "string"
        ? featuredMedia.poster_url.trim()
        : "";
    const thumb =
      typeof featuredMedia.thumbnail_url === "string"
        ? featuredMedia.thumbnail_url.trim()
        : "";

    const preferred =
      type === "image"
        ? url || poster || thumb
        : poster || thumb || url;

    if (preferred) {
      return resolveMediaUrl(preferred);
    }
  }

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
