import * as React from "react";

import { toAbsoluteUrl } from "@/lib/articleShare";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import type { SeoPage } from "@/types/siteSettings";

type DocumentHeadOptions = {
  title?: string;
  description?: string;
  keywords?: string;
  path?: string;
  replacements?: Record<string, string>;
  /** Absolute or site-relative image URL for social previews. */
  image?: string;
  /** Canonical page URL for og:url (defaults to current location). */
  url?: string;
  /** Open Graph type (e.g. article, website). */
  type?: string;
  /** ISO 8601 publish date for article pages. */
  publishedAt?: string;
};

function applyReplacements(value: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (result, [key, replacement]) =>
      result.replaceAll(`{${key}}`, replacement).replaceAll(`{${key.toLowerCase()}}`, replacement),
    value,
  );
}

function resolveSeoPage(seoPages: SeoPage[], path: string): SeoPage | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;

  const exact = seoPages.find((page) => !page.isTemplate && page.url === normalized);
  if (exact) return exact;

  if (/^\/news-details\/[^/]+$/.test(normalized)) {
    return seoPages.find((page) => page.pageKey === "article-detail");
  }

  if (normalized === "/news-details") {
    return seoPages.find((page) => page.pageKey === "news-details");
  }

  if (/^\/[^/]+$/.test(normalized)) {
    const categoryPage = seoPages.find(
      (page) => !page.isTemplate && page.url === normalized,
    );
    if (categoryPage) return categoryPage;
    return seoPages.find((page) => page.pageKey === "category");
  }

  return seoPages.find((page) => page.pageKey === "home");
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

export function useDocumentHead(options: DocumentHeadOptions = {}) {
  const { settings, seoPages } = useSiteSettings();

  React.useEffect(() => {
    const path = options.path ?? window.location.pathname;
    const seoPage = resolveSeoPage(seoPages, path);
    const replacements = options.replacements ?? {};

    const titleTemplate = options.title
      ?? (seoPage?.metaTitle
        ? applyReplacements(seoPage.metaTitle, replacements)
        : settings.siteName);

    const description = options.description
      ?? (seoPage?.metaDescription
        ? applyReplacements(seoPage.metaDescription, replacements)
        : settings.siteTag);

    const keywords = options.keywords
      ?? (seoPage?.metaKeywords
        ? applyReplacements(seoPage.metaKeywords, replacements)
        : "");

    const pageTitle = titleTemplate.trim() || settings.siteName;
    const canonicalUrl = options.url?.trim() || window.location.href.split("#")[0];
    const imageUrl = options.image ? toAbsoluteUrl(options.image) : "";
    const ogType = options.type?.trim() || "website";
    const twitterCard = imageUrl ? "summary_large_image" : "summary";

    document.title = pageTitle;

    upsertMeta("description", description);
    upsertMeta("keywords", keywords);
    upsertLink("canonical", canonicalUrl);

    upsertMeta("og:title", pageTitle, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:site_name", settings.siteName, "property");
    upsertMeta("og:url", canonicalUrl, "property");
    upsertMeta("og:type", ogType, "property");
    if (imageUrl) {
      upsertMeta("og:image", imageUrl, "property");
      upsertMeta("og:image:alt", pageTitle, "property");
    }

    if (options.publishedAt) {
      upsertMeta("article:published_time", options.publishedAt, "property");
    }

    upsertMeta("twitter:card", twitterCard);
    upsertMeta("twitter:title", pageTitle);
    upsertMeta("twitter:description", description);
    if (imageUrl) {
      upsertMeta("twitter:image", imageUrl);
      upsertMeta("twitter:image:alt", pageTitle);
    }
  }, [
    options.description,
    options.image,
    options.keywords,
    options.path,
    options.publishedAt,
    options.replacements,
    options.title,
    options.type,
    options.url,
    seoPages,
    settings,
  ]);
}
