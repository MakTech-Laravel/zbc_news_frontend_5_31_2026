import { api } from "@/api/client";
import { request } from "@/api/request";

export type ContactInquiryStatus = "new" | "read" | "replied" | "archived";

export type ContactInquiryReply = {
  id: string;
  subject: string;
  body: string;
  sentAt?: string | null;
  sentAtLabel?: string;
  adminName?: string | null;
};

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  messagePreview?: string;
  status: ContactInquiryStatus;
  statusLabel: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  repliedAt?: string | null;
  repliedAtLabel?: string | null;
  submittedAt?: string | null;
  submittedAtLabel?: string;
  updatedAt?: string | null;
  updatedAtLabel?: string;
  replies?: ContactInquiryReply[];
};

export type ContactInquiriesListResponse = {
  messages: ContactInquiry[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function mapReply(raw: Record<string, unknown>): ContactInquiryReply {
  return {
    id: String(raw.id ?? ""),
    subject: String(raw.subject ?? ""),
    body: String(raw.body ?? ""),
    sentAt: (raw.sentAt as string | undefined) ?? null,
    sentAtLabel: (raw.sentAtLabel as string | undefined) ?? "",
    adminName: (raw.adminName as string | null | undefined) ?? null,
  };
}

function mapInquiry(raw: Record<string, unknown>): ContactInquiry {
  const replies = Array.isArray(raw.replies)
    ? raw.replies.map((item) => mapReply(item as Record<string, unknown>))
    : undefined;

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: (raw.phone as string | null | undefined) ?? null,
    subject: (raw.subject as string | null | undefined) ?? null,
    message: String(raw.message ?? ""),
    messagePreview: (raw.messagePreview as string | undefined) ?? undefined,
    status: (raw.status as ContactInquiryStatus) ?? "new",
    statusLabel: String(raw.statusLabel ?? "New"),
    ipAddress: (raw.ipAddress as string | null | undefined) ?? null,
    userAgent: (raw.userAgent as string | null | undefined) ?? null,
    repliedAt: (raw.repliedAt as string | null | undefined) ?? null,
    repliedAtLabel: (raw.repliedAtLabel as string | null | undefined) ?? null,
    submittedAt: (raw.submittedAt as string | null | undefined) ?? null,
    submittedAtLabel: String(raw.submittedAtLabel ?? ""),
    updatedAt: (raw.updatedAt as string | null | undefined) ?? null,
    updatedAtLabel: String(raw.updatedAtLabel ?? ""),
    replies,
  };
}

export async function fetchAdminContactMessages(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<ContactInquiriesListResponse> {
  const response = await request.get("/admin/contact-inquiries", { params });
  const root = response.data as Record<string, unknown>;
  const rows = Array.isArray(root.data) ? root.data : [];
  const meta = (root.meta ?? {}) as ContactInquiriesListResponse["meta"];

  return {
    messages: rows.map((row) => mapInquiry(row as Record<string, unknown>)),
    meta: {
      current_page: Number(meta.current_page ?? 1),
      last_page: Number(meta.last_page ?? 1),
      per_page: Number(meta.per_page ?? 15),
      total: Number(meta.total ?? rows.length),
    },
  };
}

export async function fetchAdminContactMessage(id: string): Promise<ContactInquiry> {
  const response = await request.get(`/admin/contact-inquiries/show/${id}`);
  const root = response.data as Record<string, unknown>;
  const data = (root.data ?? root) as Record<string, unknown>;
  return mapInquiry(data);
}

export async function markContactMessageRead(id: string): Promise<void> {
  await request.post(`/admin/contact-inquiries/${id}/mark-read`);
}

export async function markContactMessageUnread(id: string): Promise<void> {
  await request.post(`/admin/contact-inquiries/${id}/mark-unread`);
}

export async function markContactMessageReplied(id: string): Promise<void> {
  await request.post(`/admin/contact-inquiries/${id}/mark-replied`);
}

export async function archiveContactMessage(id: string): Promise<void> {
  await request.post(`/admin/contact-inquiries/${id}/archive`);
}

export async function restoreContactMessage(id: string): Promise<void> {
  await request.post(`/admin/contact-inquiries/${id}/restore`);
}

export async function deleteContactMessage(id: string): Promise<void> {
  await request.delete(`/admin/contact-inquiries/${id}`);
}

export async function bulkContactMessageAction(
  action: "mark_read" | "mark_unread" | "mark_replied" | "archive" | "restore" | "delete",
  ids: string[],
): Promise<void> {
  await request.post("/admin/contact-inquiries/bulk", {
    action,
    ids: ids.map((id) => Number(id)),
  });
}

export async function replyToContactMessage(
  id: string,
  payload: { subject: string; body: string },
): Promise<void> {
  await request.post(`/admin/contact-inquiries/${id}/reply`, payload);
}

export async function exportContactMessages(
  format: "csv" | "excel",
  params?: { status?: string; search?: string },
): Promise<Blob> {
  const response = await api.get("/admin/contact-inquiries/export", {
    params: { format, ...params },
    responseType: "blob",
  });
  return response.data as Blob;
}
