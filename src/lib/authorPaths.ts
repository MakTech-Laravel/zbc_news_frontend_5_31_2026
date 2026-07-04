/**
 * URL helpers for public author profile pages.
 * Slug generation mirrors article/category slug rules until the backend provides author slugs.
 */
export function slugifyAuthorName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getAuthorPath(slug: string): string {
  const normalized = slug.trim();
  if (!normalized) return "/";
  return `/author/${encodeURIComponent(normalized)}`;
}

export function resolveAuthorSlug(name: string, slug?: string | null): string {
  const trimmedSlug = slug?.trim();
  if (trimmedSlug) return trimmedSlug;
  return slugifyAuthorName(name);
}
