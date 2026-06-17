import { env } from "@/config/env";

let runtimeFrontendUrl: string | null = null;
let runtimeApiUrl: string | null = null;

export function setRuntimePublicUrls(
  frontendUrl?: string | null,
  apiUrl?: string | null,
): void {
  runtimeFrontendUrl = sanitizeOrigin(frontendUrl);
  runtimeApiUrl = sanitizeOrigin(apiUrl);
}

function sanitizeOrigin(value?: string | null): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.origin;
  } catch {
    const normalized = value.trim().replace(/\/$/, "");
    return normalized || null;
  }
}

export function isPrivateHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  );
}

function browserOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

function browserHostname(): string {
  return typeof window !== "undefined" ? window.location.hostname : "";
}

function originFromEnvUrl(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function isPublicOrigin(origin: string): boolean {
  if (!origin) return false;
  try {
    return !isPrivateHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function pickFirstPublicOrigin(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const origin = sanitizeOrigin(candidate);
    if (origin && isPublicOrigin(origin)) {
      return origin;
    }
  }
  return "";
}

/** Canonical public site origin for article links, OG url, and clipboard text. */
export function getPublicSiteOrigin(): string {
  const fromRuntime = pickFirstPublicOrigin(runtimeFrontendUrl);
  if (fromRuntime) return fromRuntime;

  const fromEnv = pickFirstPublicOrigin(env.siteUrl);
  if (fromEnv) return fromEnv;

  const browser = browserOrigin();
  if (browser && !isPrivateHostname(browserHostname())) {
    return browser;
  }

  return browser;
}

/** Laravel web origin (APP_URL) for OG preview routes and media on the API host. */
export function getApiWebOrigin(): string {
  const fromRuntime = pickFirstPublicOrigin(runtimeApiUrl);
  if (fromRuntime) return fromRuntime;

  const fromEnv = originFromEnvUrl(env.apiBaseUrl);
  if (fromEnv && isPublicOrigin(fromEnv)) {
    return fromEnv;
  }

  const browser = browserOrigin();
  if (browser && !isPrivateHostname(browserHostname())) {
    return browser;
  }

  return fromEnv || browser;
}

export function isLocalEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return isPrivateHostname(browserHostname());
}

export function getArticlePageUrl(slug: string): string {
  return `${getPublicSiteOrigin()}/news-details/${encodeURIComponent(slug)}`;
}

export function getArticleSharePreviewUrl(slug: string): string {
  return `${getApiWebOrigin()}/share/articles/${encodeURIComponent(slug)}`;
}

/**
 * URL sent to social networks.
 * Uses the OG preview route when the API host is public; otherwise the SPA article URL.
 */
export function getShareableUrl(slug: string): string {
  const previewUrl = getArticleSharePreviewUrl(slug);
  if (isPublicOrigin(getApiWebOrigin())) {
    return previewUrl;
  }
  return getArticlePageUrl(slug);
}

export function toAbsoluteUrl(url: string): string {
  if (!url.trim()) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const origin = getPublicSiteOrigin() || getApiWebOrigin() || browserOrigin();
  if (!origin) return url;

  return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
}
