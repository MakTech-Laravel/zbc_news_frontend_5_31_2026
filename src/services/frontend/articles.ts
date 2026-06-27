import { request } from "@/api/request";
import type { Article } from "@/data/dummy/types";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { formatPublishDate } from "@/lib/publishDate";
import { resolveReadTime } from "@/lib/readTime";

export type ArticleDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  articleDescription: string;
  category: string;
  imageUrl: string;
  authorName: string;
  authorInitials: string;
  publishedAt: string;
  publishedTime: string;
  publishedAtIso: string;
  updatedAt: string;
  updatedTime: string;
  updatedAtIso: string;
  showUpdated: boolean;
  scheduledAtIso: string;
  readTime: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shareImageUrl: string;
};

function formatPublishedAt(value: unknown): {
  date: string;
  time: string;
  iso: string;
} {
  const parts = formatPublishDate(value);
  return { date: parts.date, time: parts.time, iso: parts.iso };
}

function resolveAuthorName(raw: Record<string, unknown>): string {
  if (typeof raw.author === "string") return raw.author;
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  return "ZBC News";
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

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag === "object") {
        const record = tag as Record<string, unknown>;
        if (typeof record.tag === "string") return record.tag;
        if (typeof record.name === "string") return record.name;
        if (typeof record.title === "string") return record.title;
      }
      return "";
    })
    .filter(Boolean);
}

function toInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ZN"
  );
}

function mapApiArticleDetail(raw: unknown): ArticleDetail | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = record.id;
  const title = record.title;
  const slug = record.slug;

  if (id == null || typeof title !== "string" || typeof slug !== "string") {
    return null;
  }

  const articleDescription =
    typeof record.article_description === "string"
      ? record.article_description
      : typeof record.content === "string"
        ? record.content
        : "";

  const subtitle =
    (typeof record.sub_title === "string" && record.sub_title) ||
    (typeof record.excerpt === "string" && record.excerpt) ||
    "";

  const published = formatPublishedAt(record.published_at ?? record.created_at);
  const updated = formatPublishedAt(record.updated_at);
  const scheduled = formatPublishedAt(record.scheduled_publishing);
  const showUpdated =
    Boolean(updated.iso && published.iso) &&
    new Date(updated.iso).getTime() > new Date(published.iso).getTime() + 60_000;
  const authorName = resolveAuthorName(record);
  const seo =
    record.seo && typeof record.seo === "object"
      ? (record.seo as Record<string, unknown>)
      : null;

  return {
    id: String(id),
    slug,
    title,
    subtitle,
    articleDescription,
    category: resolveCategoryLabel(record),
    imageUrl: resolveMediaUrl(
      typeof record.featured_image === "string"
        ? record.featured_image
        : typeof record.featured_image_url === "string"
          ? record.featured_image_url
          : "",
    ),
    authorName,
    authorInitials: toInitials(authorName),
    publishedAt: published.date,
    publishedTime: published.time,
    publishedAtIso: published.iso,
    updatedAt: updated.date,
    updatedTime: updated.time,
    updatedAtIso: updated.iso,
    showUpdated,
    scheduledAtIso: scheduled.iso,
    readTime: resolveReadTime(record.read_time, articleDescription, record.excerpt as string),
    tags: parseTags(record.tags),
    metaTitle:
      typeof record.meta_title === "string" && record.meta_title.trim()
        ? record.meta_title
        : typeof seo?.meta_title === "string"
          ? seo.meta_title
          : title,
    metaDescription:
      typeof record.meta_description === "string" && record.meta_description.trim()
        ? record.meta_description
        : typeof seo?.meta_description === "string"
          ? seo.meta_description
          : subtitle || stripHtmlFromArticle(articleDescription).slice(0, 160),
    metaKeywords:
      typeof record.meta_keywords === "string" && record.meta_keywords.trim()
        ? record.meta_keywords
        : typeof seo?.meta_keywords === "string"
          ? seo.meta_keywords
          : parseTags(record.tags).join(", "),
    shareImageUrl: resolveMediaUrl(
      typeof record.open_graph_image === "string" && record.open_graph_image.trim()
        ? record.open_graph_image
        : typeof record.featured_image === "string"
          ? record.featured_image
          : typeof record.featured_image_url === "string"
            ? record.featured_image_url
            : "",
    ),
  };
}

function stripHtmlFromArticle(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export type CategoryArticlesResult = {
  categoryTitle: string;
  categorySeo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
  articles: Article[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function resolveCategorySeo(body: unknown, fallbackTitle: string) {
  if (!body || typeof body !== "object") {
    return {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    };
  }

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    };
  }

  const record = payload as Record<string, unknown>;
  const category =
    record.category && typeof record.category === "object"
      ? (record.category as Record<string, unknown>)
      : null;
  const seo =
    category?.seo && typeof category.seo === "object"
      ? (category.seo as Record<string, unknown>)
      : null;

  return {
    metaTitle:
      (typeof category?.meta_title === "string" && category.meta_title) ||
      (typeof seo?.meta_title === "string" ? seo.meta_title : "") ||
      `${fallbackTitle} News — ZBC News`,
    metaDescription:
      (typeof category?.meta_description === "string" && category.meta_description) ||
      (typeof seo?.meta_description === "string" ? seo.meta_description : "") ||
      "",
    metaKeywords:
      (typeof category?.meta_keywords === "string" && category.meta_keywords) ||
      (typeof seo?.meta_keywords === "string" ? seo.meta_keywords : "") ||
      "",
  };
}

export function mapArticleListItem(raw: unknown): Article | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = record.id;
  const title = record.title;

  if (id == null || typeof title !== "string" || !title.trim()) return null;

  const published = formatPublishedAt(record.published_at ?? record.created_at);
  const updated = formatPublishedAt(record.updated_at);
  const description =
    typeof record.article_description === "string" ? record.article_description : undefined;

  return {
    id: String(id),
    slug: typeof record.slug === "string" ? record.slug : undefined,
    title,
    excerpt: typeof record.excerpt === "string" ? record.excerpt : undefined,
    imageUrl: resolveMediaUrl(
      typeof record.featured_image === "string"
        ? record.featured_image
        : typeof record.featured_image_url === "string"
          ? record.featured_image_url
          : "",
    ),
    category: resolveCategoryLabel(record),
    author: resolveAuthorName(record),
    readTime: resolveReadTime(
      record.read_time,
      description,
      typeof record.excerpt === "string" ? record.excerpt : undefined,
    ),
    publishedAt: published.date && published.time ? `${published.date} · ${published.time}` : published.date,
    publishedAtIso: published.iso || undefined,
    updatedAtIso: updated.iso || undefined,
    views: Number(record.views ?? record.view_count ?? 0) || undefined,
    tags: parseTags(record.tags),
  };
}

function extractArticleRows(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows = record.data ?? record.articles ?? record.items;
    if (Array.isArray(rows)) return rows;
  }

  return [];
}

function resolveCategoryTitle(body: unknown, fallbackSlug: string): string {
  if (!body || typeof body !== "object") {
    return fallbackSlug.replace(/-/g, " ");
  }

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;

    if (record.category && typeof record.category === "object") {
      const category = record.category as Record<string, unknown>;
      if (typeof category.title === "string") return category.title;
      if (typeof category.name === "string") return category.name;
    }

    if (typeof record.category_title === "string") return record.category_title;
    if (typeof record.title === "string" && Array.isArray(record.articles)) {
      return record.title;
    }
  }

  return fallbackSlug.replace(/-/g, " ");
}

export async function fetchGridArticles(): Promise<Article[]> {
  const response = await request.get("/articles/grid");
  return extractArticleRows(response.data)
    .map(mapArticleListItem)
    .filter((article): article is Article => article !== null);
}

export type ArticlesByTagType = "latest" | "trending" | "recommended";

export async function fetchArticlesByTag(
  tagSlug: string,
  type: ArticlesByTagType = "latest",
): Promise<Article[]> {
  const encodedTag = encodeURIComponent(tagSlug);
  const response = await request.get(`/articles/by-tag/${encodedTag}`, {
    params: { type },
  });

  return extractArticleRows(response.data)
    .map(mapArticleListItem)
    .filter((article): article is Article => article !== null);
}

let mostReadCache: Article[] | null = null;
let mostReadPromise: Promise<Article[]> | null = null;

export async function fetchMostReadArticles(): Promise<Article[]> {
  if (mostReadCache) return mostReadCache;

  if (!mostReadPromise) {
    mostReadPromise = request
      .get("/articles/most-read")
      .then((response) =>
        extractArticleRows(response.data)
          .map(mapArticleListItem)
          .filter((article): article is Article => article !== null),
      )
      .then((articles) => {
        mostReadCache = articles;
        return articles;
      })
      .catch((error) => {
        mostReadPromise = null;
        throw error;
      });
  }

  return mostReadPromise;
}

export async function fetchArticlesByCategory(
  categorySlug: string,
  page = 1,
): Promise<CategoryArticlesResult> {
  const encodedSlug = encodeURIComponent(categorySlug);
  const response = await request.get(`/articles/category/${encodedSlug}`, {
    params: { page },
  });
  const body = response.data;

  const articles = extractArticleRows(body)
    .map(mapArticleListItem)
    .filter((article): article is Article => article !== null);

  const payload = (body as { data?: Record<string, unknown> })?.data ?? body;
  const meta =
    payload && typeof payload === "object" && "meta" in payload
      ? (payload.meta as CategoryArticlesResult["meta"])
      : undefined;

  return {
    categoryTitle: resolveCategoryTitle(body, categorySlug),
    categorySeo: resolveCategorySeo(body, resolveCategoryTitle(body, categorySlug)),
    articles,
    meta,
  };
}

export async function fetchRelatedArticles(slug: string): Promise<Article[]> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/articles/related/${encodedSlug}`);
  const body = response.data;

  return extractArticleRows(body)
    .map(mapArticleListItem)
    .filter((article): article is Article => article !== null);
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/articles/show/${encodedSlug}`);
  const payload = response.data?.data ?? response.data;
  return mapApiArticleDetail(payload);
}
