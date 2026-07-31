import { request } from "@/api/request";
import type { AdminArticle, ArticleStatus } from "@/data/admin/mockArticles";
import { normalizeArticleVisibility } from "@/data/admin/articleVisibility";
import { formatPublishDateTime } from "@/lib/publishDate";
import { resolveArticleTagsFromRecord } from "@/lib/articleTags";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export type LiveUpdateEntryStatus = "draft" | "published";

export type LiveUpdateEntry = {
  id: number;
  articleId: number;
  body: string;
  postedAt: string | null;
  status: LiveUpdateEntryStatus;
  userName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type LiveUpdateShell = AdminArticle & {
  isLive: boolean;
  isLiveBlog: boolean;
  liveStartedAt: string | null;
  liveEndedAt: string | null;
  articleDescription: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  categoryId: string;
  tags: string[];
  scheduledPublishing: string | null;
  featuredImageUrl: string | null;
  openGraphImageUrl: string | null;
  featuredMediaUuid: string | null;
  posterMediaUuid: string | null;
  featuredMediaType: "image" | "video" | "audio" | null;
  featuredMediaUrl: string | null;
  featuredThumbnailUrl: string | null;
  posterUrl: string | null;
  entries: LiveUpdateEntry[];
};

function normalizeStatus(value: unknown): ArticleStatus {
  const status = typeof value === "string" ? value : "";
  if (
    status === "draft" ||
    status === "pending_review" ||
    status === "pending" ||
    status === "scheduled" ||
    status === "published" ||
    status === "archived"
  ) {
    return status === "pending" ? "pending_review" : status;
  }
  return "draft";
}

function mapEntry(raw: unknown): LiveUpdateEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id)) return null;

  const status =
    row.status === "draft" || row.status === "published" ? row.status : "published";

  const user =
    row.user && typeof row.user === "object"
      ? (row.user as Record<string, unknown>)
      : null;

  return {
    id,
    articleId: Number(row.article_id) || 0,
    body: typeof row.body === "string" ? row.body : "",
    postedAt: typeof row.posted_at === "string" ? row.posted_at : null,
    status,
    userName: typeof user?.name === "string" ? user.name : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

function mapShell(raw: unknown): LiveUpdateShell | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;

  const id = row.id != null ? String(row.id) : "";
  const slug = typeof row.slug === "string" ? row.slug : "";
  const title = typeof row.title === "string" ? row.title : "";
  if (!id || !slug) return null;

  const category =
    row.category && typeof row.category === "object"
      ? (row.category as Record<string, unknown>)
      : null;
  const user =
    row.user && typeof row.user === "object"
      ? (row.user as Record<string, unknown>)
      : null;
  const featuredMedia =
    row.featured_media && typeof row.featured_media === "object"
      ? (row.featured_media as Record<string, unknown>)
      : null;

  const entriesRaw = Array.isArray(row.live_updates) ? row.live_updates : [];
  const entries = entriesRaw
    .map(mapEntry)
    .filter((entry): entry is LiveUpdateEntry => entry !== null);

  const mediaType = featuredMedia?.type;
  const resolvedMediaType =
    mediaType === "image" || mediaType === "video" || mediaType === "audio"
      ? mediaType
      : null;

  return {
    id,
    slug,
    title,
    author: typeof user?.name === "string" ? user.name : "Unknown",
    authorId: user?.id != null ? String(user.id) : undefined,
    category: typeof category?.title === "string" ? category.title : "",
    status: normalizeStatus(row.status),
    visibility: normalizeArticleVisibility(row.visibility),
    views: typeof row.views === "number" ? row.views : 0,
    date: formatPublishDateTime(row.published_at ?? row.created_at),
    publishedAtIso: typeof row.published_at === "string" ? row.published_at : undefined,
    updatedAtIso: typeof row.updated_at === "string" ? row.updated_at : undefined,
    isLive: Boolean(row.is_live),
    isLiveBlog: Boolean(row.is_live_blog),
    liveStartedAt: typeof row.live_started_at === "string" ? row.live_started_at : null,
    liveEndedAt: typeof row.live_ended_at === "string" ? row.live_ended_at : null,
    articleDescription:
      typeof row.article_description === "string" ? row.article_description : "",
    excerpt: typeof row.excerpt === "string" ? row.excerpt : "",
    metaTitle: typeof row.meta_title === "string" ? row.meta_title : "",
    metaDescription: typeof row.meta_description === "string" ? row.meta_description : "",
    metaKeywords: typeof row.meta_keywords === "string" ? row.meta_keywords : "",
    categoryId: category?.id != null ? String(category.id) : "",
    tags: resolveArticleTagsFromRecord(row),
    scheduledPublishing:
      typeof row.scheduled_publishing === "string" ? row.scheduled_publishing : null,
    featuredImageUrl:
      typeof row.featured_image === "string" && row.featured_image
        ? resolveMediaUrl(row.featured_image)
        : null,
    openGraphImageUrl:
      typeof row.open_graph_image === "string" && row.open_graph_image
        ? resolveMediaUrl(row.open_graph_image)
        : null,
    featuredMediaUuid:
      typeof featuredMedia?.uuid === "string" ? featuredMedia.uuid : null,
    posterMediaUuid:
      typeof featuredMedia?.poster_uuid === "string" ? featuredMedia.poster_uuid : null,
    featuredMediaType: resolvedMediaType,
    featuredMediaUrl:
      typeof featuredMedia?.url === "string" && featuredMedia.url
        ? resolveMediaUrl(featuredMedia.url)
        : null,
    featuredThumbnailUrl:
      typeof featuredMedia?.thumbnail_url === "string" && featuredMedia.thumbnail_url
        ? resolveMediaUrl(featuredMedia.thumbnail_url)
        : null,
    posterUrl:
      typeof featuredMedia?.poster_url === "string" && featuredMedia.poster_url
        ? resolveMediaUrl(featuredMedia.poster_url)
        : null,
    entries,
  };
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

export async function fetchLiveUpdates(): Promise<LiveUpdateShell[]> {
  const response = await request.get("/admin/live-updates");
  const data = unwrapData(response.data);
  if (!Array.isArray(data)) return [];
  return data
    .map(mapShell)
    .filter((item): item is LiveUpdateShell => item !== null);
}

export async function fetchLiveUpdateBySlug(slug: string): Promise<LiveUpdateShell> {
  const response = await request.get(
    `/admin/live-updates/show/${encodeURIComponent(slug)}`,
  );
  const mapped = mapShell(unwrapData(response.data));
  if (!mapped) throw new Error("Live update not found");
  return mapped;
}

export async function createLiveUpdate(
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<LiveUpdateShell> {
  const response = await request.post("/admin/live-updates/store", payload, { signal });
  const mapped = mapShell(unwrapData(response.data));
  if (!mapped) throw new Error("Failed to create live update");
  return mapped;
}

export async function updateLiveUpdate(
  slug: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<LiveUpdateShell> {
  const response = await request.post(
    `/admin/live-updates/update/${encodeURIComponent(slug)}`,
    payload,
    { signal },
  );
  const mapped = mapShell(unwrapData(response.data));
  if (!mapped) throw new Error("Failed to update live update");
  return mapped;
}

export async function deleteLiveUpdate(slug: string): Promise<void> {
  await request.delete(`/admin/live-updates/delete/${encodeURIComponent(slug)}`);
}

export async function createLiveUpdateEntry(
  slug: string,
  payload: { body: string; posted_at?: string | null; status?: LiveUpdateEntryStatus },
): Promise<LiveUpdateEntry> {
  const response = await request.post(
    `/admin/live-updates/${encodeURIComponent(slug)}/entries`,
    payload,
  );
  const mapped = mapEntry(unwrapData(response.data));
  if (!mapped) throw new Error("Failed to create entry");
  return mapped;
}

export async function updateLiveUpdateEntry(
  slug: string,
  id: number,
  payload: { body?: string; posted_at?: string | null; status?: LiveUpdateEntryStatus },
): Promise<LiveUpdateEntry> {
  const response = await request.post(
    `/admin/live-updates/${encodeURIComponent(slug)}/entries/${id}`,
    payload,
  );
  const mapped = mapEntry(unwrapData(response.data));
  if (!mapped) throw new Error("Failed to update entry");
  return mapped;
}

export async function deleteLiveUpdateEntry(slug: string, id: number): Promise<void> {
  await request.delete(
    `/admin/live-updates/${encodeURIComponent(slug)}/entries/${id}`,
  );
}

export async function startLiveUpdateCoverage(slug: string): Promise<LiveUpdateShell> {
  const response = await request.post(
    `/admin/live-updates/${encodeURIComponent(slug)}/live/start`,
  );
  const mapped = mapShell(unwrapData(response.data));
  if (!mapped) throw new Error("Failed to start live coverage");
  return mapped;
}

export async function endLiveUpdateCoverage(slug: string): Promise<LiveUpdateShell> {
  const response = await request.post(
    `/admin/live-updates/${encodeURIComponent(slug)}/live/end`,
  );
  const mapped = mapShell(unwrapData(response.data));
  if (!mapped) throw new Error("Failed to end live coverage");
  return mapped;
}
