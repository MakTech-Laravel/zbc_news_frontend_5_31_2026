import { request } from "@/api/request";
import type { Article } from "@/data/dummy/types";
import { resolveMediaUrl } from "@/lib/mediaUrl";

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
  publishedAtIso: string;
  readTime: string;
  tags: string[];
};

function formatPublishedAt(value: unknown): { label: string; iso: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { label: "", iso: "" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { label: value, iso: value };
  }

  return {
    label: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    iso: date.toISOString(),
  };
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
  const authorName = resolveAuthorName(record);

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
    publishedAt: published.label,
    publishedAtIso: published.iso,
    readTime:
      typeof record.read_time === "string" && record.read_time.trim()
        ? record.read_time
        : "5 min read",
    tags: parseTags(record.tags),
  };
}

export type CategoryArticlesResult = {
  categoryTitle: string;
  articles: Article[];
};

function mapApiArticleListItem(raw: unknown): Article | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = record.id;
  const title = record.title;

  if (id == null || typeof title !== "string" || !title.trim()) return null;

  const published = formatPublishedAt(record.published_at ?? record.created_at);

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
    readTime:
      typeof record.read_time === "string" && record.read_time.trim()
        ? record.read_time
        : "5 min read",
    publishedAt: published.label,
    views: Number(record.views ?? record.view_count ?? 0) || undefined,
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
    .map(mapApiArticleListItem)
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
          .map(mapApiArticleListItem)
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
): Promise<CategoryArticlesResult> {
  const encodedSlug = encodeURIComponent(categorySlug);
  const response = await request.get(`/articles/category/${encodedSlug}`);
  const body = response.data;

  const articles = extractArticleRows(body)
    .map(mapApiArticleListItem)
    .filter((article): article is Article => article !== null);

  return {
    categoryTitle: resolveCategoryTitle(body, categorySlug),
    articles,
  };
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/articles/show/${encodedSlug}`);
  const payload = response.data?.data ?? response.data;
  return mapApiArticleDetail(payload);
}

export async function recordArticleView(slug: string): Promise<void> {
  const encodedSlug = encodeURIComponent(slug);
  await request.post(`/articles/view/${encodedSlug}`).catch(() => {});
}
