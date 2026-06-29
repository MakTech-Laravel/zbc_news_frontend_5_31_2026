import { api } from "@/api/client";
import { mapArticleTimestampFields } from "@/lib/articleTimestamps";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { resolveReadTime } from "@/lib/readTime";
import type { UserFeedArticle } from "@/types/user";
import type { UserContinueReadingItem } from "@/data/dummy/userDashboard";

export type { UserContinueReadingItem };

export const BREAKING_NEWS_TAG_SLUG = "breaking-news";
export const WORLD_NEWS_TAG_SLUG = "world";

/** Slug variants used when loading breaking news from the API. */
export const BREAKING_NEWS_TAG_SLUGS = [
  "breaking-news",
  "breaking_news",
  "breaking",
  "Breaking",
  "Breaking-News",
  "Breaking_News",
  "BreakingNews",
] as const;

export function normalizeTagKey(tag: string): string {
  return tag.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function isBreakingNewsTag(tag: string): boolean {
  const key = normalizeTagKey(tag);
  return key === "breaking" || key === "breakingnews";
}

function resolveTagSlugsForFetch(tagSlug: string): string[] {
  if (isBreakingNewsTag(tagSlug)) {
    return [...BREAKING_NEWS_TAG_SLUGS];
  }
  return [tagSlug];
}

function mergeUniqueArticles(articles: UserFeedArticle[]): UserFeedArticle[] {
  const seen = new Set<string>();
  const merged: UserFeedArticle[] = [];

  for (const article of articles) {
    if (seen.has(article.id)) continue;
    seen.add(article.id);
    merged.push(article);
  }

  return merged;
}

function mergeUniqueArticleRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  const seen = new Set<string>();
  const merged: Record<string, unknown>[] = [];

  for (const row of rows) {
    const id = row.id == null ? "" : String(row.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(row);
  }

  return merged;
}

export type TagArticleType = "latest" | "trending" | "recommended";

export type UserFeaturedStoryData = {
  id: string;
  slug?: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  views: number;
  imageUrl: string;
};

export type UserTrendingTopic = {
  id: string;
  rank: number;
  label: string;
  count: number;
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

function resolveExcerpt(raw: Record<string, unknown>): string {
  if (typeof raw.excerpt === "string" && raw.excerpt.trim()) return raw.excerpt;
  if (typeof raw.sub_title === "string" && raw.sub_title.trim()) return raw.sub_title;
  if (typeof raw.subtitle === "string" && raw.subtitle.trim()) return raw.subtitle;
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

function mapToUserFeedArticle(raw: Record<string, unknown>): UserFeedArticle | null {
  const id = raw.id;
  const title = raw.title;
  if (id == null || typeof title !== "string" || !title.trim()) return null;

  const timestamps = mapArticleTimestampFields(raw);

  return {
    id: String(id),
    slug: typeof raw.slug === "string" ? raw.slug : undefined,
    category: resolveCategoryLabel(raw),
    title,
    excerpt: resolveExcerpt(raw),
    author: resolveAuthorName(raw),
    readTime: resolveReadTime(
      raw.read_time,
      typeof raw.article_description === "string" ? raw.article_description : undefined,
      resolveExcerpt(raw),
    ),
    publishedAt: timestamps.publishedAt,
    publishedAtIso: timestamps.publishedAtIso,
    updatedAtIso: timestamps.updatedAtIso,
    views: Number(raw.views ?? raw.view_count ?? 0) || undefined,
  };
}

export function mapToFeaturedStory(
  raw: Record<string, unknown>,
): UserFeaturedStoryData | null {
  const article = mapToUserFeedArticle(raw);
  if (!article) return null;

  return {
    id: article.id,
    slug: article.slug,
    category: article.category,
    title: article.title,
    excerpt: article.excerpt,
    readTime: article.readTime,
    views: article.views ?? 0,
    imageUrl: resolveImageUrl(raw),
  };
}

export function toContinueReadingItem(article: UserFeedArticle): UserContinueReadingItem {
  return {
    id: article.id,
    slug: article.slug,
    category: article.category,
    title: article.title,
    readTime: article.readTime,
    publishedAt: article.publishedAt,
    publishedAtIso: article.publishedAtIso,
    updatedAtIso: article.updatedAtIso,
  };
}

function parseTags(raw: Record<string, unknown>): string[] {
  if (!Array.isArray(raw.tags)) return [];

  return raw.tags
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag === "object") {
        const record = tag as Record<string, unknown>;
        if (typeof record.slug === "string" && record.slug.trim()) return record.slug;
        if (typeof record.tag === "string") return record.tag;
        if (typeof record.name === "string") return record.name;
        if (typeof record.title === "string") return record.title;
      }
      return "";
    })
    .filter(Boolean);
}

export function buildTrendingTopicsFromArticles(
  rows: Record<string, unknown>[],
): UserTrendingTopic[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const tag of parseTags(row)) {
      const label = isBreakingNewsTag(tag)
        ? "Breaking News"
        : tag.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], index) => ({
      id: `topic-${index + 1}`,
      rank: index + 1,
      label,
      count,
    }));
}

async function fetchArticlesByTagSlug(
  tagSlug: string,
  type: TagArticleType = "latest",
): Promise<UserFeedArticle[]> {
  const encodedTag = encodeURIComponent(tagSlug);
  const response = await api.get(`/admin/articles/${encodedTag}/articles`, {
    params: { type },
  });

  return extractArticleRows(response.data)
    .map(mapToUserFeedArticle)
    .filter((article): article is UserFeedArticle => article !== null);
}

async function fetchArticlesByTagSlugRaw(
  tagSlug: string,
  type: TagArticleType = "latest",
): Promise<Record<string, unknown>[]> {
  const encodedTag = encodeURIComponent(tagSlug);
  const response = await api.get(`/admin/articles/${encodedTag}/articles`, {
    params: { type },
  });
  return extractArticleRows(response.data);
}

export async function fetchArticlesByTag(
  tagSlug: string,
  type: TagArticleType = "latest",
): Promise<UserFeedArticle[]> {
  const tagSlugs = resolveTagSlugsForFetch(tagSlug);
  const batches = await Promise.all(
    tagSlugs.map((slug) => fetchArticlesByTagSlug(slug, type).catch(() => [])),
  );

  return mergeUniqueArticles(batches.flat());
}

export async function fetchArticlesByTagRaw(
  tagSlug: string,
  type: TagArticleType = "latest",
): Promise<Record<string, unknown>[]> {
  const tagSlugs = resolveTagSlugsForFetch(tagSlug);
  const batches = await Promise.all(
    tagSlugs.map((slug) => fetchArticlesByTagSlugRaw(slug, type).catch(() => [])),
  );

  return mergeUniqueArticleRows(batches.flat());
}

export type TagArticleFeeds = {
  recommended: UserFeedArticle[];
  latest: UserFeedArticle[];
  trending: UserFeedArticle[];
};

export async function fetchTagArticleFeeds(
  tagSlug: string,
): Promise<TagArticleFeeds> {
  const [recommended, latest, trending] = await Promise.all([
    fetchArticlesByTag(tagSlug, "recommended"),
    fetchArticlesByTag(tagSlug, "latest"),
    fetchArticlesByTag(tagSlug, "trending"),
  ]);

  return { recommended, latest, trending };
}
