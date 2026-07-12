import type { MetaDescriptor } from "react-router";

import type { ResolvedSeo } from "@/types/resolvedSeo";

/**
 * Map a server-resolved SEO payload to React Router `meta()` descriptors:
 * title, description, keywords, robots, canonical link, Open Graph, Twitter,
 * and one JSON-LD <script> per structured-data node.
 */
export function resolvedSeoToMeta(seo: ResolvedSeo | null | undefined): MetaDescriptor[] {
  if (!seo) return [];

  const tags: MetaDescriptor[] = [];

  if (seo.title) tags.push({ title: seo.title });
  if (seo.description) tags.push({ name: "description", content: seo.description });
  if (seo.keywords) tags.push({ name: "keywords", content: seo.keywords });
  if (seo.robots) tags.push({ name: "robots", content: seo.robots });
  if (seo.canonical) tags.push({ tagName: "link", rel: "canonical", href: seo.canonical });

  const og = seo.og ?? {};
  const ogTags: Array<[string, string | undefined]> = [
    ["og:title", og.title],
    ["og:description", og.description],
    ["og:type", og.type],
    ["og:url", og.url],
    ["og:site_name", og.site_name],
    ["og:image", og.image],
    ["og:image:alt", og.image_alt],
    ["article:published_time", og.published_time],
    ["article:modified_time", og.modified_time],
  ];
  for (const [property, content] of ogTags) {
    if (content) tags.push({ property, content });
  }

  const tw = seo.twitter ?? {};
  const twTags: Array<[string, string | undefined]> = [
    ["twitter:card", tw.card],
    ["twitter:title", tw.title],
    ["twitter:description", tw.description],
    ["twitter:image", tw.image],
    ["twitter:image:alt", tw.image_alt],
  ];
  for (const [name, content] of twTags) {
    if (content) tags.push({ name, content });
  }

  for (const node of seo.jsonLd ?? []) {
    tags.push({ "script:ld+json": node });
  }

  return tags;
}
