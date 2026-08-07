import { request } from "@/api/request";
import type { ArticleFeaturedMedia } from "@/components/main-layout/shared/media/types";
import { resolveFeaturedMediaFromApi } from "@/components/main-layout/shared/media/types";
import type { Article } from "@/data/dummy/types";
import {
  formatArticleTimestamp,
  mapArticleTimestampFields,
  resolveArticleTimestamps,
} from "@/lib/articleTimestamps";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { resolveEstimatedReadTime } from "@/lib/readTime";

export type ArticleLiveUpdateEntry = {
  id: number;
  body: string;
  postedAtIso: string;
};

export type ArticleAttachment = {
  id: number;
  label: string;
  uuid: string;
  url: string;
  downloadUrl: string;
  filename: string;
  mimeType: string | null;
  extension: string | null;
  size: number | null;
  humanSize: string | null;
};

export type ArticleDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  articleDescription: string;
  category: string;
  imageUrl: string;
  featuredMedia: ArticleFeaturedMedia | null;
  attachments: ArticleAttachment[];
  authorName: string;
  authorInitials: string;
  /** Populated when the API returns author slug; otherwise derived from name in UI. */
  authorSlug?: string;
  /** Populated when the API returns author profile image. */
  authorAvatarUrl?: string;
  publishedAtIso: string;
  updatedAtIso: string;
  showUpdated: boolean;
  scheduledAtIso: string;
  readTime: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  shareImageUrl: string;
  isLive: boolean;
  isLiveBlog: boolean;
  liveEndedAtIso: string;
  liveUpdates: ArticleLiveUpdateEntry[];
};

function resolveAuthorName(raw: Record<string, unknown>): string {
  if (typeof raw.author === "string") return raw.author;
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  return "ZBC News";
}

function resolveAuthorProfileFields(raw: Record<string, unknown>): {
  authorSlug?: string;
  authorAvatarUrl?: string;
} {
  if (!raw.user || typeof raw.user !== "object") {
    return {};
  }

  const user = raw.user as Record<string, unknown>;
  const authorSlug = typeof user.slug === "string" ? user.slug : undefined;

  let authorAvatarUrl: string | undefined;
  if (typeof user.profile_image === "string" && user.profile_image.trim()) {
    authorAvatarUrl = resolveMediaUrl(user.profile_image);
  } else if (user.user_information && typeof user.user_information === "object") {
    const info = user.user_information as Record<string, unknown>;
    if (typeof info.profile_image === "string" && info.profile_image.trim()) {
      authorAvatarUrl = resolveMediaUrl(info.profile_image);
    }
  }

  return { authorSlug, authorAvatarUrl };
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

  const timestamps = resolveArticleTimestamps(
    record.published_at ?? record.created_at,
    record.updated_at,
  );
  const scheduled = formatArticleTimestamp(record.scheduled_publishing);
  const authorName = resolveAuthorName(record);
  const { authorSlug, authorAvatarUrl } = resolveAuthorProfileFields(record);
  const seo =
    record.seo && typeof record.seo === "object"
      ? (record.seo as Record<string, unknown>)
      : null;

  const imageUrl = resolveMediaUrl(
    typeof record.featured_image === "string"
      ? record.featured_image
      : typeof record.featured_image_url === "string"
        ? record.featured_image_url
        : "",
  );

  const featuredMediaRaw = resolveFeaturedMediaFromApi(record, imageUrl);
  const featuredMedia = featuredMediaRaw
    ? {
        ...featuredMediaRaw,
        url: resolveMediaUrl(featuredMediaRaw.url),
        posterUrl: resolveMediaUrl(featuredMediaRaw.posterUrl),
        thumbnailUrl: featuredMediaRaw.thumbnailUrl
          ? resolveMediaUrl(featuredMediaRaw.thumbnailUrl)
          : undefined,
      }
    : null;

  const attachmentsRaw = Array.isArray(record.attachments) ? record.attachments : [];
  const attachments: ArticleAttachment[] = attachmentsRaw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const uuid = typeof row.uuid === "string" ? row.uuid : "";
      const url = typeof row.url === "string" ? resolveMediaUrl(row.url) : "";
      if (!uuid || !url) return null;

      const extension =
        typeof row.extension === "string" && row.extension.trim()
          ? row.extension.replace(/^\./, "").toLowerCase()
          : null;
      const label =
        (typeof row.label === "string" && row.label.trim()) || "Document";
      const filenameFromApi =
        typeof row.filename === "string" && row.filename.trim()
          ? row.filename.trim()
          : "";
      const downloadUrlRaw =
        typeof row.download_url === "string" && row.download_url.trim()
          ? row.download_url
          : url;
      const filename =
        filenameFromApi ||
        (extension && !label.toLowerCase().endsWith(`.${extension}`)
          ? `${label}.${extension}`
          : label);

      return {
        id: typeof row.id === "number" ? row.id : 0,
        label,
        uuid,
        url,
        downloadUrl: resolveMediaUrl(downloadUrlRaw),
        filename,
        mimeType: typeof row.mime_type === "string" ? row.mime_type : null,
        extension,
        size: typeof row.size === "number" ? row.size : null,
        humanSize: typeof row.human_size === "string" ? row.human_size : null,
      } satisfies ArticleAttachment;
    })
    .filter((entry): entry is ArticleAttachment => entry !== null);

  const liveUpdatesRaw = Array.isArray(record.live_updates) ? record.live_updates : [];
  const liveUpdates: ArticleLiveUpdateEntry[] = liveUpdatesRaw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const entryId = Number(row.id);
      if (!Number.isFinite(entryId)) return null;
      const status = row.status === "draft" ? "draft" : "published";
      if (status === "draft") return null;
      return {
        id: entryId,
        body: typeof row.body === "string" ? row.body : "",
        postedAtIso: typeof row.posted_at === "string" ? row.posted_at : "",
      };
    })
    .filter((entry): entry is ArticleLiveUpdateEntry => entry !== null);

  return {
    id: String(id),
    slug,
    title,
    subtitle,
    articleDescription,
    category: resolveCategoryLabel(record),
    imageUrl: featuredMedia?.posterUrl || imageUrl,
    featuredMedia,
    attachments,
    authorName,
    authorInitials: toInitials(authorName),
    authorSlug,
    authorAvatarUrl,
    publishedAtIso: timestamps.published.iso,
    updatedAtIso: timestamps.updated.iso,
    showUpdated: timestamps.wasUpdated,
    scheduledAtIso: scheduled.iso,
    readTime: resolveEstimatedReadTime(
      record.estimated_read_time,
      articleDescription,
      record.excerpt as string,
    ),
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
        : featuredMedia?.posterUrl || imageUrl,
    ),
    isLive: Boolean(record.is_live),
    isLiveBlog: Boolean(record.is_live_blog),
    liveEndedAtIso:
      typeof record.live_ended_at === "string" ? record.live_ended_at : "",
    liveUpdates,
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
      `${fallbackTitle} News`,
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

  const timestamps = mapArticleTimestampFields(record);
  const description =
    typeof record.article_description === "string" ? record.article_description : undefined;

  const imageUrl = resolveMediaUrl(
    typeof record.featured_image === "string"
      ? record.featured_image
      : typeof record.featured_image_url === "string"
        ? record.featured_image_url
        : "",
  );

  const featuredMediaRaw = resolveFeaturedMediaFromApi(record, imageUrl);
  const featuredMedia = featuredMediaRaw
    ? {
        ...featuredMediaRaw,
        url: resolveMediaUrl(featuredMediaRaw.url),
        posterUrl: resolveMediaUrl(featuredMediaRaw.posterUrl),
        thumbnailUrl: featuredMediaRaw.thumbnailUrl
          ? resolveMediaUrl(featuredMediaRaw.thumbnailUrl)
          : undefined,
      }
    : null;

  return {
    id: String(id),
    slug: typeof record.slug === "string" ? record.slug : undefined,
    title,
    excerpt: typeof record.excerpt === "string" ? record.excerpt : undefined,
    imageUrl: featuredMedia?.posterUrl || imageUrl,
    featuredMedia,
    category: resolveCategoryLabel(record),
    author: resolveAuthorName(record),
    readTime: resolveEstimatedReadTime(
      record.estimated_read_time,
      description,
      typeof record.excerpt === "string" ? record.excerpt : undefined,
    ),
    publishedAt: timestamps.publishedAt,
    publishedAtIso: timestamps.publishedAtIso,
    updatedAtIso: timestamps.updatedAtIso,
    views: Number(record.views ?? record.view_count ?? 0) || undefined,
    commentCount: Number(record.comments_count ?? 0),
    tags: parseTags(record.tags),
    isLive: Boolean(record.is_live),
    isLiveBlog: Boolean(record.is_live_blog),
    liveEndedAtIso:
      typeof record.live_ended_at === "string" ? record.live_ended_at : undefined,
    serial:
      Number.isFinite(Number(record.serial)) && Number(record.serial) > 0
        ? Math.trunc(Number(record.serial))
        : undefined,
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

export type MostReadPeriod = "today" | "week" | "month" | "all";

export type MostReadMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type MostReadResult = {
  articles: Article[];
  meta: MostReadMeta;
};

type FetchMostReadOptions = {
  period?: MostReadPeriod;
  page?: number;
  perPage?: number;
};

const mostReadPage1Cache = new Map<string, MostReadResult>();
const mostReadPage1Promises = new Map<string, Promise<MostReadResult>>();

function parseMostReadMeta(raw: unknown): MostReadMeta {
  const fallback: MostReadMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0,
  };

  if (!raw || typeof raw !== "object") return fallback;

  const meta = raw as Record<string, unknown>;
  const currentPage = Number(meta.current_page ?? 1);
  const lastPage = Number(meta.last_page ?? 1);
  const perPage = Number(meta.per_page ?? 5);
  const total = Number(meta.total ?? 0);

  return {
    current_page: Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1,
    last_page: Number.isFinite(lastPage) && lastPage > 0 ? lastPage : 1,
    per_page: Number.isFinite(perPage) && perPage > 0 ? perPage : 5,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
  };
}

export async function fetchMostReadArticles(
  options: FetchMostReadOptions = {},
): Promise<MostReadResult> {
  const period = options.period ?? "today";
  const page = options.page ?? 1;
  const perPage = options.perPage ?? 5;
  const cacheKey = `${period}:${perPage}`;

  if (page === 1) {
    const cached = mostReadPage1Cache.get(cacheKey);
    if (cached) return cached;

    const inflight = mostReadPage1Promises.get(cacheKey);
    if (inflight) return inflight;
  }

  const requestPromise = request
    .get("/articles/most-read", {
      params: {
        unique: 1,
        period,
        page,
        per_page: perPage,
      },
    })
    .then((response) => {
      const body = response.data;
      const articles = extractArticleRows(body)
        .map(mapArticleListItem)
        .filter((article): article is Article => article !== null);

      const payload =
        body && typeof body === "object" && "data" in body
          ? (body as { data?: Record<string, unknown> }).data
          : body;
      const meta =
        payload && typeof payload === "object" && "meta" in payload
          ? parseMostReadMeta((payload as { meta: unknown }).meta)
          : parseMostReadMeta({
              current_page: page,
              last_page: 1,
              per_page: perPage,
              total: articles.length,
            });

      return { articles, meta } satisfies MostReadResult;
    });

  if (page === 1) {
    mostReadPage1Promises.set(cacheKey, requestPromise);
    try {
      const result = await requestPromise;
      mostReadPage1Cache.set(cacheKey, result);
      return result;
    } catch (error) {
      mostReadPage1Promises.delete(cacheKey);
      throw error;
    } finally {
      mostReadPage1Promises.delete(cacheKey);
    }
  }

  return requestPromise;
}

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type LiveBlogArticlesResult = {
  articles: Article[];
  meta: PaginationMeta;
};

export async function fetchLiveBlogArticles(
  page = 1,
  perPage = 12,
): Promise<LiveBlogArticlesResult> {
  const response = await request.get("/articles/live-blogs", {
    params: { page, per_page: perPage },
  });
  const body = response.data;
  const articles = extractArticleRows(body)
    .map(mapArticleListItem)
    .filter((article): article is Article => article !== null);

  const payload = (body as { data?: Record<string, unknown> })?.data ?? body;
  const rawMeta =
    payload && typeof payload === "object" && "meta" in payload
      ? (payload.meta as Record<string, unknown>)
      : null;

  return {
    articles,
    meta: {
      current_page: Number(rawMeta?.current_page ?? page) || 1,
      last_page: Number(rawMeta?.last_page ?? 1) || 1,
      per_page: Number(rawMeta?.per_page ?? perPage) || perPage,
      total: Number(rawMeta?.total ?? articles.length) || 0,
    },
  };
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
