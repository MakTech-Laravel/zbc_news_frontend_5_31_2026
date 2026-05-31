import type { ArticleEditorForm } from "@/components/admin/articles/editor/types";
import { ARTICLE_EDITOR_AUTHORS } from "@/components/admin/articles/editor/types";
import type { AdminArticle, ArticleStatus } from "@/data/admin/mockArticles";
import { MOCK_ADMIN_ARTICLES } from "@/data/admin/mockArticles";
import { resolveStatusAfterPublish } from "@/data/admin/articleWorkflow";

const ARTICLES_STORAGE_KEY = "zbc-admin-articles";
const DRAFTS_STORAGE_KEY = "zbc-admin-article-drafts";

export type StoredArticleDraft = {
  form: ArticleEditorForm;
  status: ArticleStatus;
  lastSavedAt: string;
  lastAutoSavedAt?: string;
};

type ArticleOverrides = Record<string, AdminArticle>;
type DraftOverrides = Record<string, StoredArticleDraft>;

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

function authorLabel(authorId: string, fallback = "Unknown") {
  const match = ARTICLE_EDITOR_AUTHORS.find((a) => a.value === authorId);
  return match?.label && match.value ? match.label : fallback;
}

function serializeForm(form: ArticleEditorForm): ArticleEditorForm {
  return {
    ...form,
    featuredImage: null,
    featuredImagePreview:
      form.featuredImagePreview && !form.featuredImagePreview.startsWith("blob:")
        ? form.featuredImagePreview
        : null,
  };
}

export function loadAdminArticles(): AdminArticle[] {
  const overrides = readJson<ArticleOverrides>(ARTICLES_STORAGE_KEY, {});
  const merged = new Map(MOCK_ADMIN_ARTICLES.map((a) => [a.id, { ...a }]));

  for (const [id, article] of Object.entries(overrides)) {
    merged.set(id, article);
  }

  return Array.from(merged.values()).sort(
    (a, b) =>
      new Date(b.lastSavedAt ?? b.date).getTime() -
      new Date(a.lastSavedAt ?? a.date).getTime(),
  );
}

export function getAdminArticleById(id: string): AdminArticle | undefined {
  return loadAdminArticles().find((a) => a.id === id);
}

export function loadArticleDraft(id: string): StoredArticleDraft | null {
  const drafts = readJson<DraftOverrides>(DRAFTS_STORAGE_KEY, {});
  return drafts[id] ?? null;
}

export function saveArticleDraft(
  id: string,
  payload: StoredArticleDraft,
  options?: { auto?: boolean },
) {
  const drafts = readJson<DraftOverrides>(DRAFTS_STORAGE_KEY, {});
  drafts[id] = {
    ...payload,
    form: serializeForm(payload.form),
    lastAutoSavedAt: options?.auto ? payload.lastSavedAt : payload.lastAutoSavedAt,
  };
  writeJson(DRAFTS_STORAGE_KEY, drafts);
}

export function upsertAdminArticleFromEditor(
  id: string,
  form: ArticleEditorForm,
  status: ArticleStatus,
  existing?: AdminArticle,
): AdminArticle {
  const now = new Date().toISOString();
  const articles = readJson<ArticleOverrides>(ARTICLES_STORAGE_KEY, {});

  const article: AdminArticle = {
    id,
    title: form.title.trim() || "Untitled article",
    author: authorLabel(form.authorId, existing?.author ?? "Unknown"),
    category: form.category || existing?.category || "Uncategorized",
    status,
    views: existing?.views ?? 0,
    date: existing?.date ?? new Date().toLocaleDateString(),
    lastSavedAt: now,
    hasUnsavedDraft: false,
  };

  articles[id] = article;
  writeJson(ARTICLES_STORAGE_KEY, articles);

  saveArticleDraft(id, {
    form: serializeForm(form),
    status,
    lastSavedAt: now,
  });

  return article;
}

export function markArticleUnsaved(id: string, hasUnsavedDraft: boolean) {
  const articles = readJson<ArticleOverrides>(ARTICLES_STORAGE_KEY, {});
  const base = getAdminArticleById(id) ?? articles[id];
  if (!base) return;

  articles[id] = { ...base, hasUnsavedDraft };
  writeJson(ARTICLES_STORAGE_KEY, articles);
}

export function createNewArticleId() {
  return `draft-${Date.now()}`;
}

export function getDefaultEditorFormForArticle(
  article: AdminArticle,
): Partial<ArticleEditorForm> {
  const stored = loadArticleDraft(article.id);
  if (stored) return stored.form;

  const author = ARTICLE_EDITOR_AUTHORS.find((a) => a.label === article.author);

  return {
    title: article.title,
    category: article.category,
    authorId: author?.value ?? "",
    excerpt: "",
    content: `<p>Edit <strong>${article.title}</strong>…</p>`,
    slug: article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-"),
    scheduledAt: article.status === "scheduled" ? "" : "",
    tags: [],
    featuredImage: null,
    featuredImagePreview: null,
  };
}

export function persistArticleWorkflow(
  id: string,
  form: ArticleEditorForm,
  status: ArticleStatus,
  existing?: AdminArticle,
  options?: { auto?: boolean },
) {
  const resolvedStatus =
    status === "published" ? resolveStatusAfterPublish(form.scheduledAt) : status;

  const article = upsertAdminArticleFromEditor(id, form, resolvedStatus, existing);
  saveArticleDraft(
    id,
    {
      form: serializeForm(form),
      status: resolvedStatus,
      lastSavedAt: article.lastSavedAt ?? new Date().toISOString(),
      lastAutoSavedAt: options?.auto ? article.lastSavedAt ?? undefined : undefined,
    },
    options,
  );

  return { article, status: resolvedStatus };
}
