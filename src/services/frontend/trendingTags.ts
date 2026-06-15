import { request } from "@/api/request";
import type { TrendingTag } from "@/data/dummy/types";

function extractRows(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows = record.data ?? record.tags ?? record.items;
    if (Array.isArray(rows)) return rows;
  }

  return [];
}

function formatTagLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function mapTrendingTag(raw: unknown, index: number): TrendingTag | null {
  if (typeof raw === "string" && raw.trim()) {
    const slug = raw.trim().toLowerCase().replace(/\s+/g, "-");
    return {
      id: `tag-${index}`,
      label: formatTagLabel(raw),
      href: `/?tag=${encodeURIComponent(slug)}`,
    };
  }

  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const tagSlug =
    (typeof record.tag === "string" && record.tag) ||
    (typeof record.slug === "string" && record.slug) ||
    "";
  const name =
    (typeof record.name === "string" && record.name) ||
    (typeof record.title === "string" && record.title) ||
    (typeof record.label === "string" && record.label) ||
    tagSlug;

  if (!name) return null;

  const id = record.id != null ? String(record.id) : `tag-${index}`;
  const href =
    (typeof record.href === "string" && record.href) ||
    (typeof record.url === "string" && record.url) ||
    (tagSlug ? `/?tag=${encodeURIComponent(tagSlug)}` : "/");

  return {
    id,
    label: formatTagLabel(name),
    href,
  };
}

export async function fetchTrendingTags(): Promise<TrendingTag[]> {
  const response = await request.get("/trending-tags");
  return extractRows(response.data)
    .map(mapTrendingTag)
    .filter((tag): tag is TrendingTag => tag !== null);
}
