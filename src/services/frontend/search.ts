import { request } from "@/api/request";
import { resolveArticleImageUrl } from "@/lib/mediaUrl";
import { resolveReadTime } from "@/lib/readTime";
import { getSearchSessionHeaders } from "@/lib/searchSession";

export type SearchResultItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  readTime: string;
};

export type SearchHistoryItem = {
  id: number;
  query: string;
  searched_at: string;
};

function resolveCategoryLabel(raw: Record<string, unknown>): string {
  if (typeof raw.category === "string") return raw.category;
  if (raw.category && typeof raw.category === "object") {
    const category = raw.category as Record<string, unknown>;
    if (typeof category.title === "string") return category.title;
    if (typeof category.name === "string") return category.name;
  }
  return "News";
}

function formatPublishedAt(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapSearchResult(raw: unknown): SearchResultItem | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = record.id;
  const title = record.title;
  if (id == null || typeof title !== "string" || !title.trim()) return null;

  return {
    id: String(id),
    slug: typeof record.slug === "string" ? record.slug : "",
    title,
    excerpt:
      typeof record.excerpt === "string" && record.excerpt.trim()
        ? record.excerpt
        : typeof record.sub_title === "string"
          ? record.sub_title
          : "",
    category: resolveCategoryLabel(record),
    imageUrl: resolveArticleImageUrl(record),
    publishedAt: formatPublishedAt(record.published_at ?? record.created_at),
    readTime: resolveReadTime(
      record.read_time,
      typeof record.article_description === "string" ? record.article_description : undefined,
      typeof record.excerpt === "string" ? record.excerpt : undefined,
    ),
  };
}

function extractRows(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  if (Array.isArray(data)) return data;
  return [];
}

export async function searchArticles(query: string, limit = 10): Promise<SearchResultItem[]> {
  const response = await request.get("/articles/search", {
    params: { q: query, limit },
  });

  return extractRows(response.data)
    .map(mapSearchResult)
    .filter((item): item is SearchResultItem => item !== null);
}

export async function fetchSearchHistory(): Promise<SearchHistoryItem[]> {
  const response = await request.get("/search/history", {
    headers: getSearchSessionHeaders(),
  });

  const data = response.data?.data ?? response.data;
  return Array.isArray(data) ? (data as SearchHistoryItem[]) : [];
}

export async function saveSearchHistory(query: string): Promise<void> {
  await request.post(
    "/search/history",
    { query },
    { headers: getSearchSessionHeaders() },
  );
}

export async function clearSearchHistory(): Promise<void> {
  await request.delete("/search/history", {
    headers: getSearchSessionHeaders(),
  });
}
