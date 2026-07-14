import * as React from "react";
import { useLocation } from "react-router-dom";

import { getPublicSiteOrigin } from "@/lib/appOrigins";
import { toAbsoluteUrl } from "@/lib/articleShare";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { useResolvedSeo } from "@/hooks/useResolvedSeo";

type DocumentHeadOptions = {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
  /** Absolute or site-relative image URL for social previews. */
  image?: string;
  /** Canonical page URL for og:url (defaults to the resolved/current location). */
  url?: string;
  /** Open Graph type (e.g. article, website). */
  type?: string;
  /** ISO 8601 publish date for article pages. */
  publishedAt?: string;
  /** ISO 8601 modified date for article pages. */
  modifiedAt?: string;
};

/**
 * Static titles for auth/utility routes that have no seo_pages row.
 * Public content pages resolve their title server-side via useResolvedSeo.
 */
const STATIC_PAGE_TITLES: Record<string, string> = {
  "/login": "Login",
  "/login/email": "Login",
  "/register": "Sign Up",
  "/forget-password": "Forgot Password",
  "/otp-verification": "Verify Code",
  "/reset-password": "Reset Password",
  "/unauthorized": "Unauthorized",
};

function normalizePath(path: string) {
  return path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
}

function resolveStaticPageTitle(path: string, siteName: string) {
  const label = STATIC_PAGE_TITLES[normalizePath(path)];
  return label ? `${label} — ${siteName}` : "";
}

function upsertMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  if (!content.trim()) return;

  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${name}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

function upsertLink(rel: string, href: string) {
  if (!href.trim()) return;

  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

const JSON_LD_ID = "seo-jsonld";

function upsertJsonLd(nodes: Array<Record<string, unknown>>) {
  let element = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;

  if (!nodes.length) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = JSON_LD_ID;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(nodes.length === 1 ? nodes[0] : nodes);
}

export function useDocumentHead(options: DocumentHeadOptions = {}) {
  const { settings } = useSiteSettings();
  const path =
    options.path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const { data: resolved } = useResolvedSeo(path);

  React.useEffect(() => {
    const siteName = settings.siteName;

    // Precedence: explicit page override -> server-resolved value -> site default.
    const pageTitle =
      options.title?.trim() ||
      resolveStaticPageTitle(path, siteName) ||
      resolved?.title ||
      siteName;

    const description =
      options.description?.trim() || resolved?.description || settings.siteTag;

    const keywords = options.keywords?.trim() || resolved?.keywords || "";

    const siteOrigin = getPublicSiteOrigin();
    const canonicalUrl =
      options.url?.trim() ||
      resolved?.canonical ||
      (siteOrigin ? `${siteOrigin}${normalizePath(path)}` : window.location.href.split("#")[0]);

    const imageUrl = options.image ? toAbsoluteUrl(options.image) : resolved?.og?.image ?? "";
    const ogType = options.type?.trim() || resolved?.og?.type || "website";
    const twitterCard = imageUrl ? "summary_large_image" : "summary";
    const robots = resolved?.robots || "index,follow";
    const publishedAt = options.publishedAt ?? resolved?.og?.published_time;
    const modifiedAt = options.modifiedAt ?? resolved?.og?.modified_time;

    document.title = pageTitle;

    upsertMeta("description", description);
    upsertMeta("keywords", keywords);
    upsertMeta("robots", robots);
    upsertLink("canonical", canonicalUrl);

    upsertMeta("og:title", pageTitle, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:site_name", siteName, "property");
    upsertMeta("og:url", canonicalUrl, "property");
    upsertMeta("og:type", ogType, "property");
    if (imageUrl) {
      upsertMeta("og:image", imageUrl, "property");
      upsertMeta("og:image:alt", pageTitle, "property");
    }

    if (publishedAt) {
      upsertMeta("article:published_time", publishedAt, "property");
    }
    if (modifiedAt) {
      upsertMeta("article:modified_time", modifiedAt, "property");
    }

    upsertMeta("twitter:card", twitterCard);
    upsertMeta("twitter:title", pageTitle);
    upsertMeta("twitter:description", description);
    if (imageUrl) {
      upsertMeta("twitter:image", imageUrl);
      upsertMeta("twitter:image:alt", pageTitle);
    }

    upsertJsonLd(resolved?.jsonLd ?? []);
  }, [
    options.description,
    options.image,
    options.keywords,
    options.path,
    options.publishedAt,
    options.modifiedAt,
    options.title,
    options.type,
    options.url,
    path,
    resolved,
    settings,
  ]);
}

/** Default document head for routes that do not set their own SEO metadata. */
export function useRouteDocumentHead() {
  const { pathname } = useLocation();
  useDocumentHead({ path: pathname });
}
