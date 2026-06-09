export const EXCERPT_MAX_LENGTH = 160;
export const META_TITLE_MAX_LENGTH = 70;
export const META_DESCRIPTION_MAX_LENGTH = 160;

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
