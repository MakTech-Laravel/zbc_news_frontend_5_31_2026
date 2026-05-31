import type { UserNotification } from "@/types/user";
import { userNotifications as dummyNotifications } from "@/data/dummy/userPages";

/** Replace with `fetch('/api/user/notifications')` when backend is ready. */
export async function fetchUserNotifications(): Promise<UserNotification[]> {
  return dummyNotifications.map((n) => ({ ...n }));
}

export function getUnreadCount(notifications: UserNotification[]): number {
  return notifications.filter((n) => n.unread).length;
}
