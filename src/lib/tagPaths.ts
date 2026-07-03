export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

export function getTagPath(tag: string): string {
  const slug = slugifyTag(tag);
  return slug ? `/tag/${encodeURIComponent(slug)}` : "/";
}

export function formatTagLabel(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
