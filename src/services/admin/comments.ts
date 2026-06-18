import { request } from "@/api/request";
import type { ArticleComment } from "@/types/comments";

export type AdminCommentRow = ArticleComment & {
  status: "pending" | "approved" | "rejected";
};

export type AdminCommentsListResponse = {
  comments: AdminCommentRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function mapComment(raw: Record<string, unknown>): AdminCommentRow {
  const replies = Array.isArray(raw.replies)
    ? raw.replies.map((item) => mapComment(item as Record<string, unknown>))
    : [];

  return {
    id: String(raw.id ?? ""),
    body: String(raw.body ?? ""),
    authorName: String(raw.authorName ?? "Reader"),
    authorAvatar: (raw.authorAvatar as string | null | undefined) ?? null,
    status: (raw.status as AdminCommentRow["status"]) ?? "pending",
    time: String(raw.time ?? ""),
    articleTitle: (raw.articleTitle as string | undefined) ?? undefined,
    articleSlug: (raw.articleSlug as string | undefined) ?? undefined,
    replies,
  };
}

export async function fetchAdminComments(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<AdminCommentsListResponse> {
  const response = await request.get("/admin/comments", { params });
  const root = response.data as Record<string, unknown>;
  const rows = Array.isArray(root.data) ? root.data : [];
  const meta = (root.meta ?? {}) as AdminCommentsListResponse["meta"];

  return {
    comments: rows.map((row) => mapComment(row as Record<string, unknown>)),
    meta: {
      current_page: Number(meta.current_page ?? 1),
      last_page: Number(meta.last_page ?? 1),
      per_page: Number(meta.per_page ?? 15),
      total: Number(meta.total ?? rows.length),
    },
  };
}

export async function approveAdminComment(id: string): Promise<void> {
  await request.post(`/admin/comments/${id}/approve`);
}

export async function rejectAdminComment(id: string): Promise<void> {
  await request.post(`/admin/comments/${id}/reject`);
}

export async function deleteAdminComment(id: string): Promise<void> {
  await request.delete(`/admin/comments/${id}`);
}
