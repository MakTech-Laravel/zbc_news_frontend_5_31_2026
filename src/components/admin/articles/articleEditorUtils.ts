export const EXCERPT_MAX_LENGTH = 160;
export const META_TITLE_MAX_LENGTH = 70;
export const META_DESCRIPTION_MAX_LENGTH = 160;
export const META_KEYWORDS_MAX_LENGTH = 255;

export function buildArticleSeoDefaults(input: {
  title: string;
  excerpt?: string;
  articleDescription?: string;
  tags?: string[];
  categoryTitle?: string;
  siteName?: string;
}) {
  const siteName = input.siteName?.trim() || "ZBC News";
  const title = input.title.trim();
  const descriptionSource =
    input.excerpt?.trim() || stripHtml(input.articleDescription ?? "").trim();
  const meta_description = descriptionSource.slice(0, META_DESCRIPTION_MAX_LENGTH);
  const suffix = ` — ${siteName}`;
  const meta_title = title
    ? `${title.slice(0, Math.max(0, META_TITLE_MAX_LENGTH - suffix.length))}${suffix}`
    : "";
  const meta_keywords = [...(input.tags ?? []), input.categoryTitle, "news"]
    .filter(Boolean)
    .join(", ")
    .slice(0, META_KEYWORDS_MAX_LENGTH);

  return { meta_title, meta_description, meta_keywords };
}

export function buildCategorySeoDefaults(
  title: string,
  slug: string,
  siteName = "ZBC News",
) {
  const meta_title = `${title} News — ${siteName}`.slice(0, META_TITLE_MAX_LENGTH);
  const meta_description = `Latest ${title.toLowerCase()} news, analysis, and updates from ${siteName}.`.slice(
    0,
    META_DESCRIPTION_MAX_LENGTH,
  );
  const meta_keywords = `${slug}, ${title.toLowerCase()}, news, articles`.slice(
    0,
    META_KEYWORDS_MAX_LENGTH,
  );

  return { meta_title, meta_description, meta_keywords };
}

export function slugifyArticleTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripHtml(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? "";
}

export function countWords(html: string) {
  const trimmed = stripHtml(html).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}
