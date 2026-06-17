import { api } from "@/api/client";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { resolveReadTime } from "@/lib/readTime";
import type {
  LongReadArticle,
  LongReadCollection,
  LongReadStats,
  LongReadTab,
} from "@/types/longReads";
import { filterLongReadArticles } from "@/types/longReads";

function extractArticleRows(body: unknown): Record<string, unknown>[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (Array.isArray(payload)) {
    return payload.filter(
      (row): row is Record<string, unknown> => !!row && typeof row === "object",
    );
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows = record.data ?? record.articles ?? record.items;
    if (Array.isArray(rows)) {
      return rows.filter(
        (row): row is Record<string, unknown> => !!row && typeof row === "object",
      );
    }
  }

  return [];
}

function resolveCategoryLabel(raw: Record<string, unknown>): string {
  if (typeof raw.category === "string") return raw.category;
  if (raw.category && typeof raw.category === "object") {
    const category = raw.category as Record<string, unknown>;
    if (typeof category.title === "string") return category.title;
    if (typeof category.name === "string") return category.name;
  }
  return "News";
}

function resolveAuthorName(raw: Record<string, unknown>): string {
  if (typeof raw.author === "string") return raw.author;
  if (raw.author && typeof raw.author === "object") {
    const author = raw.author as Record<string, unknown>;
    if (typeof author.name === "string") return author.name;
  }
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  return "ZBC News";
}

function resolveDescription(raw: Record<string, unknown>): string {
  if (typeof raw.excerpt === "string" && raw.excerpt.trim()) return raw.excerpt;
  if (typeof raw.sub_title === "string" && raw.sub_title.trim()) return raw.sub_title;
  if (typeof raw.subtitle === "string" && raw.subtitle.trim()) return raw.subtitle;
  if (typeof raw.article_description === "string" && raw.article_description.trim()) {
    return raw.article_description;
  }
  return "";
}

function resolveImageUrl(raw: Record<string, unknown>): string {
  return resolveMediaUrl(
    typeof raw.featured_image === "string"
      ? raw.featured_image
      : typeof raw.featured_image_url === "string"
        ? raw.featured_image_url
        : typeof raw.image_url === "string"
          ? raw.image_url
          : "",
  );
}

function mapToLongReadArticle(raw: Record<string, unknown>): LongReadArticle | null {
  const id = raw.id;
  const title = raw.title;
  if (id == null || typeof title !== "string" || !title.trim()) return null;

  return {
    id: String(id),
    slug: typeof raw.slug === "string" ? raw.slug : undefined,
    category: resolveCategoryLabel(raw),
    title,
    description: resolveDescription(raw),
    author: resolveAuthorName(raw),
    readTime: resolveReadTime(
      raw.read_time,
      typeof raw.article_description === "string" ? raw.article_description : undefined,
      typeof raw.excerpt === "string" ? raw.excerpt : undefined,
    ),
    views: Number(raw.views ?? raw.view_count ?? 0) || 0,
    imageUrl: resolveImageUrl(raw),
  };
}

function parseReadTimeMinutes(readTime: string): number {
  const match = readTime.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function buildStats(articles: LongReadArticle[]): LongReadStats {
  const totalMinutes = articles.reduce(
    (sum, article) => sum + parseReadTimeMinutes(article.readTime),
    0,
  );
  const average = articles.length ? Math.round(totalMinutes / articles.length) : 0;

  return {
    articles: articles.length,
    averageReadTime: average > 0 ? `${average} min` : "—",
  };
}

function buildCollections(articles: LongReadArticle[]): LongReadCollection[] {
  const counts = new Map<string, number>();

  for (const article of articles) {
    counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export type LongReadsData = {
  articles: LongReadArticle[];
  stats: LongReadStats;
  collections: LongReadCollection[];
};

export async function fetchLongReads(): Promise<LongReadsData> {
  const response = await api.get("/admin/articles/long-reads");
  const articles = extractArticleRows(response.data)
    .map(mapToLongReadArticle)
    .filter((article): article is LongReadArticle => article !== null);

  return {
    articles,
    stats: buildStats(articles),
    collections: buildCollections(articles),
  };
}

export function getLongReadsForTab(
  data: LongReadsData,
  tab: LongReadTab,
): LongReadArticle[] {
  return filterLongReadArticles(data.articles, tab);
}
