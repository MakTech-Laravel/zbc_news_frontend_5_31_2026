import { request } from "@/api/request";
import {
  mapResolvedSeo,
  type ResolvedSeo,
  type ResolvedSeoApi,
} from "@/types/resolvedSeo";
import {
  mapSeoPageFromApi,
  type SeoPage,
  type SeoPageApi,
} from "@/types/siteSettings";

function extractPayload<T>(body: unknown): T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid API response");
  }
  const root = body as Record<string, unknown>;
  return (root.data ?? root) as T;
}

function extractRows(body: unknown): SeoPageApi[] {
  const payload = extractPayload<unknown>(body);
  if (Array.isArray(payload)) return payload as SeoPageApi[];
  return [];
}

export async function fetchAdminSeoPages(): Promise<SeoPage[]> {
  const response = await request.get("/admin/seo-pages");
  return extractRows(response.data).map(mapSeoPageFromApi);
}

export async function fetchAdminSeoPage(pageKey: string): Promise<SeoPage | null> {
  try {
    const response = await request.get(`/admin/seo-pages/show/${encodeURIComponent(pageKey)}`);
    const raw = extractPayload<SeoPageApi>(response.data);
    return mapSeoPageFromApi(raw);
  } catch {
    return null;
  }
}

export async function updateAdminSeoPage(
  pageKey: string,
  patch: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    noindex: boolean;
    ogImage: string;
  },
): Promise<SeoPage> {
  const response = await request.post(
    `/admin/seo-pages/update/${encodeURIComponent(pageKey)}`,
    {
      meta_title: patch.metaTitle,
      meta_description: patch.metaDescription,
      meta_keywords: patch.metaKeywords,
      canonical_url: patch.canonicalUrl || null,
      noindex: patch.noindex,
      og_image: patch.ogImage || null,
    },
  );
  const raw = extractPayload<SeoPageApi>(response.data);
  return mapSeoPageFromApi(raw);
}

export async function fetchPublicSeoPages(): Promise<SeoPage[]> {
  const response = await request.get("/seo-pages");
  return extractRows(response.data).map(mapSeoPageFromApi);
}

/** Admin: force-rebuild the cached sitemaps (same as `php artisan sitemap:refresh`). */
export async function refreshSitemapCache(): Promise<void> {
  await request.post("/admin/seo/sitemap/refresh");
}

function triggerBlobDownload(data: Blob, filename: string): void {
  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Admin: download the current cached general or news sitemap for inspection. */
export async function downloadSitemapFile(type: "general" | "news"): Promise<void> {
  const response = await request.get("/admin/seo/sitemap/download", {
    params: { type },
    responseType: "blob",
  });
  triggerBlobDownload(response.data as Blob, type === "news" ? "news-sitemap.xml" : "sitemap.xml");
}

/** Admin: download the current robots.txt for inspection. */
export async function downloadRobotsFile(): Promise<void> {
  const response = await request.get("/admin/seo/robots/download", {
    responseType: "blob",
  });
  triggerBlobDownload(response.data as Blob, "robots.txt");
}

/**
 * Fetch the fully-resolved (server-interpolated) SEO metadata for a path.
 * The backend owns entity data and does all placeholder interpolation, so the
 * client receives final title/description/keywords/canonical/OG/JSON-LD.
 */
export async function fetchResolvedSeo(path: string): Promise<ResolvedSeo | null> {
  try {
    const response = await request.get("/seo-pages/resolve", {
      params: { path },
    });
    const raw = extractPayload<ResolvedSeoApi>(response.data);
    return mapResolvedSeo(raw);
  } catch {
    return null;
  }
}
