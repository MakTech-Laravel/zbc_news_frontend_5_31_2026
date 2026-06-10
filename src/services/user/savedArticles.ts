import { api } from "@/api/client";
import type { SavedArticlesQuery, UserCategoryFilter, UserFeedArticle } from "@/types/user";

export const savedQuickFilters = [
  "Recently Saved",
  "Most Read",
  "Oldest First",
];

type SavedArticleRecord = {
  id: number | string;
  article_id: number | string;
  user_id?: number | string;
  created_at?: string;
  updated_at?: string;
  saved_at?: string;
  article?: Record<string, unknown>;
};

function extractSavedRecords(body: unknown): SavedArticleRecord[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (Array.isArray(payload)) return payload as SavedArticleRecord[];

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows = record.data ?? record.items ?? record.save_articles;
    if (Array.isArray(rows)) return rows as SavedArticleRecord[];
  }

  return [];
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

function resolveCategory(article: Record<string, unknown>): {
  label: string;
  slug: string;
} {
  const category = article.category;

  if (typeof category === "string") {
    return { label: category, slug: category.toLowerCase().replace(/\s+/g, "-") };
  }

  if (category && typeof category === "object") {
    const record = category as Record<string, unknown>;
    const label =
      (typeof record.title === "string" && record.title) ||
      (typeof record.name === "string" && record.name) ||
      "News";
    const slug =
      (typeof record.slug === "string" && record.slug) ||
      String(record.id ?? label.toLowerCase().replace(/\s+/g, "-"));
    return { label, slug };
  }

  return { label: "News", slug: "news" };
}

function resolveAuthor(article: Record<string, unknown>): string {
  if (typeof article.author === "string") return article.author;
  if (article.author && typeof article.author === "object") {
    const author = article.author as Record<string, unknown>;
    if (typeof author.name === "string") return author.name;
  }
  if (article.user && typeof article.user === "object") {
    const user = article.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  return "ZBC News";
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

function mapToUserFeedArticle(
  saveRecord: SavedArticleRecord,
  article: Record<string, unknown>,
): UserFeedArticle {
  const savedAt =
    saveRecord.saved_at ?? saveRecord.created_at ?? saveRecord.updated_at ?? "";
  const { label: category, slug: categorySlug } = resolveCategory(article);
  const articleId = article.id ?? saveRecord.article_id;

  return {
    id: String(articleId),
    savedRecordId: String(saveRecord.id),
    slug: typeof article.slug === "string" ? article.slug : undefined,
    category,
    categorySlug,
    title:
      (typeof article.title === "string" && article.title) ||
      `Article #${saveRecord.article_id}`,
    excerpt:
      (typeof article.sub_title === "string" && article.sub_title) ||
      (typeof article.subtitle === "string" && article.subtitle) ||
      (typeof article.excerpt === "string" && article.excerpt) ||
      "",
    author: resolveAuthor(article),
    readTime:
      (typeof article.read_time === "string" && article.read_time.trim()) ||
      "5 min read",
    publishedAt: formatPublishedAt(
      article.published_at ?? article.created_at ?? savedAt,
    ),
    savedAt,
    views: Number(article.views ?? article.view_count ?? article.views_count ?? 0) || undefined,
  };
}

async function fetchArticleLookup(
  articleIds: number[],
): Promise<Map<number, Record<string, unknown>>> {
  const lookup = new Map<number, Record<string, unknown>>();
  if (articleIds.length === 0) return lookup;

  try {
    const response = await api.get("/articles");
    for (const row of extractArticleRows(response.data)) {
      const id = Number(row.id);
      if (!Number.isNaN(id) && articleIds.includes(id)) {
        lookup.set(id, row);
      }
    }
  } catch (error) {
    console.error("Failed to fetch articles for saved list:", error);
  }

  const missingIds = articleIds.filter((id) => !lookup.has(id));
  await Promise.all(
    missingIds.map(async (articleId) => {
      try {
        const response = await api.get(`/admin/articles/show/${articleId}`);
        const article = response.data?.data ?? response.data;
        if (article && typeof article === "object") {
          lookup.set(articleId, article as Record<string, unknown>);
        }
      } catch {
        lookup.set(articleId, { id: articleId });
      }
    }),
  );

  return lookup;
}

async function loadSavedArticlesData(): Promise<{
  records: SavedArticleRecord[];
  lookup: Map<number, Record<string, unknown>>;
}> {
  const response = await api.get("/admin/save-articles");
  const records = extractSavedRecords(response.data);
  const articleIds = [
    ...new Set(
      records
        .map((record) => Number(record.article_id))
        .filter((id) => !Number.isNaN(id)),
    ),
  ];

  const embeddedLookup = new Map<number, Record<string, unknown>>();
  for (const record of records) {
    const articleId = Number(record.article_id);
    if (!Number.isNaN(articleId) && record.article && typeof record.article === "object") {
      embeddedLookup.set(articleId, record.article);
    }
  }

  const missingIds = articleIds.filter((id) => !embeddedLookup.has(id));
  const fetchedLookup = await fetchArticleLookup(missingIds);

  const lookup = new Map<number, Record<string, unknown>>(embeddedLookup);
  for (const [id, article] of fetchedLookup) {
    lookup.set(id, article);
  }

  return { records, lookup };
}

function buildCategories(articles: UserFeedArticle[]): UserCategoryFilter[] {
  const categoryMap = new Map<string, UserCategoryFilter>();

  for (const article of articles) {
    const key = article.categorySlug || article.category;
    const existing = categoryMap.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    categoryMap.set(key, {
      id: key,
      label: article.category,
      count: 1,
    });
  }

  return [
    { id: "all", label: "All Categories", count: articles.length },
    ...Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
  ];
}

function applySavedArticlesQuery(
  records: SavedArticleRecord[],
  lookup: Map<number, Record<string, unknown>>,
  query?: SavedArticlesQuery,
): UserFeedArticle[] {
  let items = records
    .map((record) => {
      const articleId = Number(record.article_id);
      const article =
        (record.article && typeof record.article === "object"
          ? record.article
          : lookup.get(articleId)) ?? { id: record.article_id };

      return mapToUserFeedArticle(record, article);
    })
    .filter((article) => article.title);

  if (query?.categoryId && query.categoryId !== "all") {
    items = items.filter(
      (article) =>
        article.categorySlug === query.categoryId || article.category === query.categoryId,
    );
  }

  if (query?.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    items = items.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q),
    );
  }

  switch (query?.quickFilter) {
    case "Oldest First":
      items = [...items].sort(
        (a, b) =>
          new Date(a.savedAt ?? 0).getTime() - new Date(b.savedAt ?? 0).getTime(),
      );
      break;
    case "Most Read":
      items = [...items].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
      break;
    case "Recently Saved":
    default:
      items = [...items].sort(
        (a, b) =>
          new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime(),
      );
      break;
  }

  return items;
}

export async function fetchSavedArticleCategories(): Promise<UserCategoryFilter[]> {
  try {
    const { records, lookup } = await loadSavedArticlesData();
    const articles = applySavedArticlesQuery(records, lookup);
    return buildCategories(articles);
  } catch (error) {
    console.error("Failed to fetch saved article categories:", error);
    return [{ id: "all", label: "All Categories", count: 0 }];
  }
}

export async function fetchSavedArticles(
  query?: SavedArticlesQuery,
): Promise<UserFeedArticle[]> {
  try {
    const { records, lookup } = await loadSavedArticlesData();
    return applySavedArticlesQuery(records, lookup, query);
  } catch (error) {
    console.error("Failed to fetch saved articles:", error);
    return [];
  }
}

export async function unsaveArticle(articleId: string | number): Promise<void> {
  await api.post("/admin/save-articles/toggle", {
    article_id: Number(articleId),
  });
}
