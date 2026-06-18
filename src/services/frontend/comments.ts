import { request } from "@/api/request";
import type {
  ArticleComment,
  ArticleCommentsPayload,
  CreateCommentInput,
} from "@/types/comments";

function mapComment(raw: Record<string, unknown>): ArticleComment {
  const replies = Array.isArray(raw.replies)
    ? raw.replies.map((item) => mapComment(item as Record<string, unknown>))
    : [];

  return {
    id: String(raw.id ?? ""),
    body: String(raw.body ?? ""),
    authorName: String(raw.authorName ?? "Reader"),
    authorAvatar: (raw.authorAvatar as string | null | undefined) ?? null,
    isOwn: Boolean(raw.isOwn),
    status: raw.status as ArticleComment["status"],
    time: String(raw.time ?? ""),
    createdAtIso: (raw.createdAtIso as string | undefined) ?? undefined,
    parentId: raw.parentId ? String(raw.parentId) : null,
    articleId: raw.articleId ? String(raw.articleId) : undefined,
    articleTitle: (raw.articleTitle as string | undefined) ?? undefined,
    articleSlug: (raw.articleSlug as string | undefined) ?? undefined,
    replies,
  };
}

export async function fetchArticleComments(slug: string): Promise<ArticleCommentsPayload> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/articles/${encodedSlug}/comments`);
  const body = (response.data?.data ?? response.data) as Record<string, unknown>;

  const commentsRaw = Array.isArray(body.comments) ? body.comments : body;
  const comments = Array.isArray(commentsRaw)
    ? commentsRaw.map((item) => mapComment(item as Record<string, unknown>))
    : [];

  return {
    comments,
    count: typeof body.count === "number" ? body.count : comments.length,
  };
}

export async function postArticleComment(
  slug: string,
  input: CreateCommentInput,
): Promise<{ comment: ArticleComment; pendingModeration: boolean; message: string }> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.post(`/articles/${encodedSlug}/comments`, {
    body: input.body,
    parent_id: input.parentId ? Number(input.parentId) : undefined,
    guest_name: input.guestName,
    guest_email: input.guestEmail,
  });

  const root = response.data as Record<string, unknown>;
  const payload = (root.data ?? root) as Record<string, unknown>;

  return {
    comment: mapComment(payload),
    pendingModeration: Boolean(root.pending_moderation),
    message: String(root.message ?? "Comment submitted."),
  };
}
