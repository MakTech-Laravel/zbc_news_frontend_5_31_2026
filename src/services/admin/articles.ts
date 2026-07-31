import { request } from "@/api/request";
import { normalizeArticleVisibility } from "@/data/admin/articleVisibility";
import type { AdminArticle, ArticleStatus } from "@/data/admin/mockArticles";
import {
  DEFAULT_SITE_TIMEZONE,
  formatArticleTimestamp,
} from "@/lib/articleTimestamps";
import { parsePublishDate } from "@/lib/publishDate";

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

function formatArticleDate(value: unknown, timeZone = DEFAULT_SITE_TIMEZONE): string {
  return formatArticleTimestamp(value, timeZone).label || "—";
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

function resolveAuthorId(raw: Record<string, unknown>): string | undefined {
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (user.id != null) return String(user.id);
  }
  if (raw.author && typeof raw.author === "object") {
    const author = raw.author as Record<string, unknown>;
    if (author.id != null) return String(author.id);
  }
  return undefined;
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
    authorId: resolveAuthorId(record),
    category: resolveCategoryLabel(record),
    status: normalizeArticleStatus(record.status),
    visibility: normalizeArticleVisibility(record.visibility),
    views: Number(record.views ?? record.view_count ?? 0),
    date: formatArticleDate(record.published_at ?? record.created_at),
    publishedAtIso:
      typeof record.published_at === "string" ? record.published_at : undefined,
    createdAtIso:
      typeof record.created_at === "string" ? record.created_at : undefined,
    updatedAtIso:
      typeof record.updated_at === "string" ? record.updated_at : undefined,
    updatedAt: formatArticleDate(record.updated_at),
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

export type ArticleAutoSaveResult = {
  success: boolean;
  id: number;
  slug: string;
  updated_at: string;
};

export async function autoSaveAdminArticle(
  payload: Record<string, unknown>,
  slug?: string,
  signal?: AbortSignal,
): Promise<ArticleAutoSaveResult> {
  const url = slug
    ? `/admin/articles/auto-save/${encodeURIComponent(slug)}`
    : "/admin/articles/auto-save";

  const response = await request.post(url, payload, { signal });
  const data = response.data?.data;

  if (!data || typeof data !== "object") {
    throw new Error("Invalid auto-save response");
  }

  const record = data as Record<string, unknown>;

  return {
    success: Boolean(record.success ?? true),
    id: Number(record.id),
    slug: String(record.slug ?? ""),
    updated_at: String(record.updated_at ?? new Date().toISOString()),
  };
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

const ARCHIVE_MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getArchivedArticleFilterDate(article: AdminArticle): Date | null {
  return (
    parsePublishDate(article.publishedAtIso) ??
    parsePublishDate(article.updatedAtIso) ??
    null
  );
}

export function buildArchiveYearFilterOptions(
  articles: AdminArticle[],
): AdminFilterOption[] {
  const years = new Set<number>();

  articles
    .filter((article) => article.status === "archived")
    .forEach((article) => {
      const date = getArchivedArticleFilterDate(article);
      if (date) years.add(date.getFullYear());
    });

  return [
    { value: "all", label: "All Years" },
    ...[...years]
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) })),
  ];
}

export function buildArchiveMonthFilterOptions(
  articles: AdminArticle[],
  yearFilter: string,
): AdminFilterOption[] {
  const months = new Set<number>();
  const year = yearFilter === "all" ? null : Number.parseInt(yearFilter, 10);

  articles
    .filter((article) => article.status === "archived")
    .forEach((article) => {
      const date = getArchivedArticleFilterDate(article);
      if (!date) return;
      if (year !== null && date.getFullYear() !== year) return;
      months.add(date.getMonth() + 1);
    });

  return [
    { value: "all", label: "All Months" },
    ...[...months]
      .sort((a, b) => a - b)
      .map((month) => ({
        value: String(month),
        label: ARCHIVE_MONTH_LABELS[month - 1] ?? String(month),
      })),
  ];
}

export function buildArchiveAuthorFilterOptions(
  articles: AdminArticle[],
): AdminFilterOption[] {
  const seen = new Set<string>();

  return [
    { value: "all", label: "All Authors" },
    ...articles
      .filter((article) => article.status === "archived")
      .filter((article) => {
        const key = article.authorId ?? article.author;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.author.localeCompare(b.author))
      .map((article) => ({
        value: article.authorId ?? article.author,
        label: article.author,
      })),
  ];
}

export function matchesArchivedArticleFilters(
  article: AdminArticle,
  filters: {
    year: string;
    month: string;
    category: string;
    author: string;
  },
) {
  if (article.status !== "archived") return true;

  const date = getArchivedArticleFilterDate(article);

  if (filters.year !== "all") {
    const year = Number.parseInt(filters.year, 10);
    if (!date || date.getFullYear() !== year) return false;
  }

  if (filters.month !== "all") {
    const month = Number.parseInt(filters.month, 10);
    if (!date || date.getMonth() + 1 !== month) return false;
  }

  if (filters.category !== "all" && article.category !== filters.category) {
    return false;
  }

  if (filters.author !== "all") {
    const authorKey = article.authorId ?? article.author;
    if (authorKey !== filters.author) return false;
  }

  return true;
}
