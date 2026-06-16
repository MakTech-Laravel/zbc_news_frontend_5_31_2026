import { env } from "@/config/env";

export type SharePlatform = "facebook" | "twitter" | "linkedin" | "whatsapp";

export type ArticleSharePayload = {
  slug: string;
  title: string;
  summary?: string;
  imageUrl?: string;
};

function getApiWebOrigin(): string {
  try {
    return new URL(env.apiBaseUrl).origin;
  } catch {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
}

function isPrivateHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  );
}

function isPublicOrigin(origin: string): boolean {
  try {
    return !isPrivateHostname(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/** Public site origin for canonical article URLs (og:url). */
export function getSiteOrigin(): string {
  if (env.siteUrl) return env.siteUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function isLocalEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return isPrivateHostname(window.location.hostname);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function getArticlePageUrl(slug: string): string {
  return `${getSiteOrigin()}/news-details/${encodeURIComponent(slug)}`;
}

/**
 * Laravel share preview route — server-rendered OG tags for Facebook/LinkedIn crawlers.
 */
export function getArticleSharePreviewUrl(slug: string): string {
  return `${getApiWebOrigin()}/share/articles/${encodeURIComponent(slug)}`;
}

/**
 * URL sent to social networks.
 * Prefer the OG preview page when the API is on a public host (production).
 */
export function getShareableUrl(slug: string): string {
  const previewUrl = getArticleSharePreviewUrl(slug);
  if (isPublicOrigin(getApiWebOrigin())) {
    return previewUrl;
  }
  return getArticlePageUrl(slug);
}

/** Facebook always uses the OG preview route so title/image meta can be scraped when public. */
export function getFacebookShareUrl(slug: string): string {
  return getArticleSharePreviewUrl(slug);
}

export type SocialShareOptions = {
  slug: string;
  url: string;
  title: string;
  summary?: string;
};

export function buildSocialShareUrl(
  platform: SharePlatform,
  options: SocialShareOptions,
): string {
  const { url, title, summary, slug } = options;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const pageUrl = encodeURIComponent(getArticlePageUrl(slug));

  switch (platform) {
    case "facebook": {
      if (env.facebookAppId) {
        return (
          `https://www.facebook.com/dialog/share` +
          `?app_id=${encodeURIComponent(env.facebookAppId)}` +
          `&href=${encodedUrl}` +
          `&display=popup` +
          `&redirect_uri=${pageUrl}`
        );
      }

      // Official Facebook share-button query params (keeps ?u= in the web sharer).
      return (
        `https://www.facebook.com/sharer/sharer.php` +
        `?u=${encodedUrl}` +
        `&sdk=joey` +
        `&display=popup` +
        `&ref=plugin` +
        `&src=share_button`
      );
    }
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "whatsapp": {
      const text = summary ? `${title} — ${summary}` : title;
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    }
  }
}

export function buildArticleSocialLinks(payload: ArticleSharePayload) {
  const shareUrl = getShareableUrl(payload.slug);
  const facebookUrl = getFacebookShareUrl(payload.slug);
  const options: SocialShareOptions = {
    slug: payload.slug,
    url: shareUrl,
    title: payload.title,
    summary: payload.summary,
  };

  return {
    facebook: buildSocialShareUrl("facebook", { ...options, url: facebookUrl }),
    twitter: buildSocialShareUrl("twitter", options),
    linkedin: buildSocialShareUrl("linkedin", options),
    whatsapp: buildSocialShareUrl("whatsapp", options),
  };
}

export type SocialShareLink = {
  platform: SharePlatform;
  label: string;
  href: string;
};

export function getArticleSharePlatforms(payload: ArticleSharePayload): SocialShareLink[] {
  const links = buildArticleSocialLinks(payload);

  return [
    { platform: "facebook", label: "Facebook", href: links.facebook },
    { platform: "twitter", label: "X", href: links.twitter },
    { platform: "linkedin", label: "LinkedIn", href: links.linkedin },
    { platform: "whatsapp", label: "WhatsApp", href: links.whatsapp },
  ];
}

export function openSocialShareWindow(href: string, platform: SharePlatform): void {
  if (platform === "whatsapp") {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }

  const width = platform === "linkedin" ? 520 : 640;
  const height = platform === "linkedin" ? 570 : 520;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

  window.open(
    href,
    `${platform}-share`,
    `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`,
  );
}

export function buildShareClipboardText(payload: ArticleSharePayload): string {
  const pageUrl = getArticlePageUrl(payload.slug);
  if (payload.summary?.trim()) {
    return `${payload.title}\n${payload.summary}\n${pageUrl}`;
  }
  return `${payload.title}\n${pageUrl}`;
}

export function toAbsoluteUrl(url: string): string {
  if (!url.trim()) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const origin = getSiteOrigin() || (typeof window !== "undefined" ? window.location.origin : "");
  if (!origin) return url;
  return url.startsWith("/") ? `${origin}${url}` : `${origin}/${url}`;
}
