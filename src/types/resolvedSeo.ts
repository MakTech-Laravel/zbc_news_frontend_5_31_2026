/** Fully-resolved SEO payload returned by GET /seo-pages/resolve. */

export type ResolvedSeoOg = {
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  site_name?: string;
  image?: string;
  image_alt?: string;
  published_time?: string;
  modified_time?: string;
};

export type ResolvedSeoTwitter = {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  image_alt?: string;
};

export type ResolvedSeo = {
  pageKey: string;
  matchedEntity: string | null;
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  robots: string;
  og: ResolvedSeoOg;
  twitter: ResolvedSeoTwitter;
  jsonLd: Array<Record<string, unknown>>;
};

export type ResolvedSeoApi = {
  page_key?: string;
  matched_entity?: string | null;
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  og?: ResolvedSeoOg;
  twitter?: ResolvedSeoTwitter;
  json_ld?: Array<Record<string, unknown>>;
};

export function mapResolvedSeo(raw: ResolvedSeoApi): ResolvedSeo {
  return {
    pageKey: raw.page_key ?? "",
    matchedEntity: raw.matched_entity ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    keywords: raw.keywords ?? "",
    canonical: raw.canonical ?? "",
    robots: raw.robots ?? "index,follow",
    og: raw.og ?? {},
    twitter: raw.twitter ?? {},
    jsonLd: Array.isArray(raw.json_ld) ? raw.json_ld : [],
  };
}
