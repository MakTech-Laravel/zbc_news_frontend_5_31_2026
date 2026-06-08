import { request } from "@/api/request";
import type { AdminArticle, ArticleStatus } from "@/data/admin/mockArticles";

export type AdminArticleApiCategory = {
  id?: number | string;
  title?: string;
  name?: string;
  slug?: string;
  status?: string;
};

export type AdminArticlesListResult = {
  articles: AdminArticle[];
  categories: AdminArticleApiCategory[];
};

export type AdminFilterOption = {
  value: string;
  label: string;
};

function normalizeArticleStatus(value: unknown): ArticleStatus {
  const status = typeof value === "string" ? value : "";
  if (
    status === "draft" ||
    status === "pending_review" ||
    status === "scheduled" ||
    status === "published" ||
    status === "archived"
  ) {
    return status;
  }
  return "draft";
}

function formatArticleDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function resolveCategoryLabel(raw: Record<string, unknown>): string {
  if (typeof raw.category === "string") return raw.category;
  if (raw.category && typeof raw.category === "object") {
    const category = raw.category as Record<string, unknown>;
    if (typeof category.title === "string") return category.title;
    if (typeof category.name === "string") return category.name;
  }
  if (typeof raw.category_title === "string") return raw.category_title;
  if (typeof raw.category_name === "string") return raw.category_name;
  return "";
}

function resolveAuthorLabel(raw: Record<string, unknown>): string {
  if (typeof raw.author === "string") return raw.author;
  if (raw.author && typeof raw.author === "object") {
    const author = raw.author as Record<string, unknown>;
    if (typeof author.name === "string") return author.name;
  }
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  return "Unknown";
}

function mapApiArticle(raw: unknown): AdminArticle | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = record.id;
  const title = record.title;
  const slug = typeof record.slug === "string" ? record.slug : "";
  if (id == null || typeof title !== "string" || !slug) return null;

  return {
    id: String(id),
    slug,
    title,
    author: resolveAuthorLabel(record),
    category: resolveCategoryLabel(record),
    status: normalizeArticleStatus(record.status),
    views: Number(record.views ?? record.view_count ?? 0),
    date: formatArticleDate(record.date ?? record.created_at ?? record.published_at),
    lastSavedAt:
      typeof record.last_saved_at === "string"
        ? record.last_saved_at
        : typeof record.updated_at === "string"
          ? record.updated_at
          : null,
    hasUnsavedDraft: Boolean(record.has_unsaved_draft ?? record.hasUnsavedDraft),
  };
}

function normalizeApiCategory(raw: unknown): AdminArticleApiCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const title =
    typeof record.title === "string"
      ? record.title
      : typeof record.name === "string"
        ? record.name
        : undefined;
  if (!title) return null;

  return {
    id: record.id as number | string | undefined,
    title,
    slug: typeof record.slug === "string" ? record.slug : undefined,
    status: typeof record.status === "string" ? record.status : "active",
  };
}

function extractArticleList(body: unknown): AdminArticle[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (Array.isArray(payload)) {
    return payload
      .map(mapApiArticle)
      .filter((article): article is AdminArticle => article !== null);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows = record.data ?? record.articles ?? record.items;

    if (Array.isArray(rows)) {
      return rows
        .map(mapApiArticle)
        .filter((article): article is AdminArticle => article !== null);
    }
  }

  return [];
}

function extractCategoryList(body: unknown): AdminArticleApiCategory[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  const candidates: unknown[] = [];

  if (Array.isArray(root.categories)) candidates.push(root.categories);
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.categories)) candidates.push(record.categories);
    if (Array.isArray(record.category_list)) candidates.push(record.category_list);
  }

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    return candidate
      .map(normalizeApiCategory)
      .filter((category): category is AdminArticleApiCategory => category !== null);
  }

  return [];
}

export function parseAdminArticlesResponse(body: unknown): AdminArticlesListResult {
  return {
    articles: extractArticleList(body),
    categories: extractCategoryList(body),
  };
}

export async function fetchAdminArticles(): Promise<AdminArticlesListResult> {
  const response = await request.get("/articles");
  return parseAdminArticlesResponse(response.data);
}

export async function fetchAdminTrashedArticles(): Promise<AdminArticlesListResult> {
  const response = await request.get("/admin/articles/trashed");
  return parseAdminArticlesResponse(response.data);
}

export async function restoreAdminArticle(slug: string): Promise<void> {
  const encodedSlug = encodeURIComponent(slug);
  await request.post(`/admin/articles/restore/${encodedSlug}`);
}

export async function permanentlyDeleteAdminArticle(slug: string): Promise<void> {
  const encodedSlug = encodeURIComponent(slug);
  await request.delete(`/admin/articles/force/${encodedSlug}`);
}

export function buildArticleCategoryFilterOptions(
  categories: AdminArticleApiCategory[],
  articles: AdminArticle[],
): AdminFilterOption[] {
  if (categories.length > 0) {
    const seen = new Set<string>();
    return [
      { value: "all", label: "All Categories" },
      ...categories
        .filter((category) => category.status === "active" && category.title)
        .filter((category) => {
          const key = category.title!;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((category) => ({
          value: category.title!,
          label: category.title!,
        })),
    ];
  }

  const seen = new Set<string>();
  const titles = articles
    .map((article) => article.category.trim())
    .filter(Boolean)
    .filter((title) => {
      if (seen.has(title)) return false;
      seen.add(title);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));

  return [
    { value: "all", label: "All Categories" },
    ...titles.map((title) => ({ value: title, label: title })),
  ];
}

export function matchesArticleSearch(article: AdminArticle, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    article.title.toLowerCase().includes(q) ||
    article.author.toLowerCase().includes(q)
  );
}
