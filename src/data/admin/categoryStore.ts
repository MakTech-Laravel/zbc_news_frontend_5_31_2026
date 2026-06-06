import type { AdminCategoryRow } from "@/components/admin/categories/useCategoriesDataTable";
import { MOCK_ADMIN_CATEGORIES } from "@/data/admin/mockCategories";
import { loadAdminArticles } from "@/data/admin/articleDummyStore";

const CATEGORIES_STORAGE_KEY = "zbc-admin-categories";

type CategoryOverrides = Record<string, AdminCategoryRow>;
type DeletedIds = string[];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readDeletedIds(): Set<string> {
  return new Set(readJson<DeletedIds>(`${CATEGORIES_STORAGE_KEY}-deleted`, []));
}

function writeDeletedIds(ids: Set<string>) {
  writeJson(`${CATEGORIES_STORAGE_KEY}-deleted`, Array.from(ids));
}

export function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type RawCategory = Partial<AdminCategoryRow> & {
  id: string | number;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeCategory(raw: RawCategory): AdminCategoryRow {
  const status = raw.status === "inactive" ? "inactive" : "active";
  return {
    id: String(raw.id),
    title: raw.title ?? raw.name ?? "",
    slug: raw.slug ?? "",
    description: raw.description,
    status,
    articleCount: raw.articleCount ?? 0,
    created_at: raw.created_at ?? raw.createdAt ?? "",
    updated_at: raw.updated_at ?? raw.updatedAt ?? "",
  };
}

function compareCategoryTitle(a: AdminCategoryRow, b: AdminCategoryRow) {
  return (a.title || "").localeCompare(b.title || "");
}

function countArticlesByCategoryName(name: string) {
  return loadAdminArticles().filter((a) => a.category === name).length;
}

function withArticleCounts(categories: AdminCategoryRow[]): AdminCategoryRow[] {
  return categories.map((cat) => ({
    ...cat,
    articleCount: countArticlesByCategoryName(cat.title),
  }));
}

export function loadAdminCategories(): AdminCategoryRow[] {
  const overrides = readJson<CategoryOverrides>(CATEGORIES_STORAGE_KEY, {});
  const deleted = readDeletedIds();
  const merged = new Map(
    MOCK_ADMIN_CATEGORIES.filter((c) => !deleted.has(c.id)).map((c) => [c.id, { ...c }]),
  );

  for (const [id, category] of Object.entries(overrides)) {
    if (!deleted.has(id)) merged.set(id, normalizeCategory({ ...category, id }));
  }

  return withArticleCounts(
    Array.from(merged.values())
      .map((category) => normalizeCategory(category))
      .sort(compareCategoryTitle),
  );
}

export function getAdminCategoryById(id: string): AdminCategoryRow | undefined {
  return loadAdminCategories().find((c) => c.id === id);
}

export function createCategoryId() {
  return `cat-${Date.now()}`;
}

export function upsertAdminCategory(
  payload: Omit<AdminCategoryRow, "articleCount" | "createdAt"> & {
    articleCount?: number;
    createdAt?: string;
  },
): AdminCategoryRow {
  const store = readJson<CategoryOverrides>(CATEGORIES_STORAGE_KEY, {});
  const existing = getAdminCategoryById(payload.id);
  const category: AdminCategoryRow = {
    ...payload,
    articleCount: payload.articleCount ?? existing?.articleCount ?? 0,
    created_at:
      payload.createdAt ??
      existing?.created_at ??
      new Date().toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }),
  };

  store[payload.id] = category;
  writeJson(CATEGORIES_STORAGE_KEY, store);

  const deleted = readDeletedIds();
  deleted.delete(payload.id);
  writeDeletedIds(deleted);

  return withArticleCounts([category])[0]!;
}

export function deleteAdminCategory(id: string): { ok: true } | { ok: false; reason: string } {
  const category = getAdminCategoryById(id);
  if (!category) return { ok: false, reason: "Category not found." };

  if (category.articleCount > 0) {
    return {
      ok: false,
      reason: `Cannot delete "${category.title}" while ${category.articleCount} article(s) use it.`,
    };
  }

  const store = readJson<CategoryOverrides>(CATEGORIES_STORAGE_KEY, {});
  delete store[id];
  writeJson(CATEGORIES_STORAGE_KEY, store);

  const deleted = readDeletedIds();
  deleted.add(id);
  writeDeletedIds(deleted);

  return { ok: true };
}

export function getActiveCategoryNames(): string[] {
  return loadAdminCategories()
    .filter((c) => c.status === "active")
    .map((c) => c.title);
}

export function getArticleCategoryFilterOptions() {
  const active = loadAdminCategories().filter(
    (c) => c.status === "active" && c.title,
  );
  return [
    { value: "all", label: "All Categories" },
    ...active.map((c) => ({ value: c.title, label: c.title })),
  ];
}

export function getArticleEditorCategoryOptions() {
  const active = loadAdminCategories().filter(
    (c) => c.status === "active" && c.title,
  );
  return [
    { value: "", label: "Select Category" },
    ...active.map((c) => ({ value: c.title, label: c.title })),
  ];
}
