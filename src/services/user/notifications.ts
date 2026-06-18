import { request } from "@/api/request";
import type { UserNotification, UserNotificationsResponse } from "@/types/notifications";

function mapNotification(raw: Record<string, unknown>): UserNotification {
  return {
    id: String(raw.id ?? ""),
    tab: (raw.tab as UserNotification["tab"]) ?? "system",
    title: String(raw.title ?? ""),
    body: String(raw.body ?? ""),
    time: String(raw.time ?? ""),
    icon: (raw.icon as UserNotification["icon"]) ?? "recommended",
    unread: Boolean(raw.unread),
    showReadArticle: Boolean(raw.showReadArticle),
    showMarkRead: Boolean(raw.showMarkRead),
    articleSlug: (raw.articleSlug as string | null | undefined) ?? null,
  };
}

export async function fetchUserNotifications(
  category?: string,
): Promise<UserNotificationsResponse> {
  const response = await request.get("/admin/user/notifications", {
    params: category && category !== "all" ? { category } : undefined,
  });

  const body = response.data as Record<string, unknown>;
  const rows = Array.isArray(body.data) ? body.data : [];
  const unreadCount =
    typeof body.unread_count === "number"
      ? body.unread_count
      : rows.filter((row) => (row as UserNotification).unread).length;

  return {
    notifications: rows.map((row) => mapNotification(row as Record<string, unknown>)),
    unreadCount,
  };
}

export async function markNotificationRead(id: string): Promise<number> {
  const response = await request.post(`/admin/user/notifications/${id}/read`);
  const body = response.data as Record<string, unknown>;

  return typeof body.unread_count === "number" ? body.unread_count : 0;
}

export async function markAllNotificationsRead(): Promise<void> {
  await request.post("/admin/user/notifications/read-all");
}

export function getUnreadCount(notifications: UserNotification[]): number {
  return notifications.filter((n) => n.unread).length;
}
