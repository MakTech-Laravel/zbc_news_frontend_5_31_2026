import * as React from "react";

import { useAuth } from "@/auth/useAuth";
import {
  fetchUserNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/user/notifications";
import { disconnectEcho, subscribeToUserNotifications } from "@/lib/echo";
import type { UserNotification } from "@/types/notifications";

type UserNotificationsContextValue = {
  notifications: UserNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  filterByTab: (tabId: string) => UserNotification[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const UserNotificationsContext = React.createContext<UserNotificationsContextValue | null>(
  null,
);

function mapRealtimeNotification(payload: Record<string, unknown>): UserNotification {
  return {
    id: String(payload.id ?? ""),
    tab: (payload.tab as UserNotification["tab"]) ?? "system",
    title: String(payload.title ?? ""),
    body: String(payload.body ?? ""),
    time: String(payload.time ?? "Just now"),
    icon: (payload.icon as UserNotification["icon"]) ?? "recommended",
    unread: payload.unread !== false,
    showReadArticle: Boolean(payload.showReadArticle),
    showMarkRead: Boolean(payload.showMarkRead),
    articleSlug: (payload.articleSlug as string | null | undefined) ?? null,
  };
}

export function UserNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const data = await fetchUserNotifications();
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  }, []);

  React.useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    refresh()
      .catch(() => {
        if (!cancelled) {
          setNotifications([]);
          setUnreadCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, refresh]);

  React.useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const unsubscribe = subscribeToUserNotifications(user.id, (payload) => {
      const incoming = mapRealtimeNotification(payload);
      setNotifications((prev) => {
        if (prev.some((item) => item.id === incoming.id)) {
          return prev;
        }
        return [incoming, ...prev];
      });
      if (incoming.unread) {
        setUnreadCount((count) => count + 1);
      }
    });

    return () => {
      unsubscribe();
      disconnectEcho();
    };
  }, [user?.id]);

  const markAsRead = React.useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, unread: false, showMarkRead: false, showReadArticle: false }
          : n,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      const nextCount = await markNotificationRead(id);
      setUnreadCount(nextCount);
    } catch {
      await refresh();
    }
  }, [refresh]);

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        unread: false,
        showMarkRead: false,
        showReadArticle: false,
      })),
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      await refresh();
    }
  }, [refresh]);

  const filterByTab = React.useCallback(
    (tabId: string) => {
      if (tabId === "unread") return notifications.filter((n) => n.unread);
      if (tabId === "breaking") return notifications.filter((n) => n.tab === "breaking");
      if (tabId === "topics") return notifications.filter((n) => n.tab === "topic");
      return notifications;
    },
    [notifications],
  );

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount: unreadCount || getUnreadCount(notifications),
      markAsRead,
      markAllAsRead,
      filterByTab,
      loading,
      refresh,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, filterByTab, loading, refresh],
  );

  return (
    <UserNotificationsContext.Provider value={value}>
      {children}
    </UserNotificationsContext.Provider>
  );
}

export function useUserNotificationsContext() {
  const ctx = React.useContext(UserNotificationsContext);
  if (!ctx) {
    throw new Error("useUserNotificationsContext must be used within UserNotificationsProvider");
  }
  return ctx;
}
