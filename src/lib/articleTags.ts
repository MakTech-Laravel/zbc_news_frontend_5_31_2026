function resolveTagLabel(record: Record<string, unknown>): string {
  if (typeof record.name === "string" && record.name.trim()) return record.name.trim();
  if (typeof record.title === "string" && record.title.trim()) return record.title.trim();
  if (typeof record.tag === "string" && record.tag.trim()) return record.tag.trim();
  if (typeof record.slug === "string" && record.slug.trim()) return record.slug.trim();
  if (typeof record.label === "string" && record.label.trim()) return record.label.trim();
  return "";
}

/** Normalizes article tag values from API/form payloads into display strings. */
export function parseArticleTags(raw: unknown): string[] {
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((tag) => {
      if (typeof tag === "string") return tag.trim();
      if (typeof tag === "number") return String(tag);
      if (tag && typeof tag === "object") {
        return resolveTagLabel(tag as Record<string, unknown>);
      }
      return "";
    })
    .filter(Boolean);
}

export function resolveArticleTagsFromRecord(
  record: Record<string, unknown>,
): string[] {
  return parseArticleTags(record.tags ?? record.article_tags ?? record.tag_list);
}
