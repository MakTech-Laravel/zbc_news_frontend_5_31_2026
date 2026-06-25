import * as React from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/auth/useAuth";
import { env } from "@/config/env";
import {
  fetchUserNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/user/notifications";
import { subscribeToUserNotifications } from "@/lib/echo";
import type { UserNotification } from "@/types/notifications";

type UserNotificationsContextValue = {
  notifications: UserNotification[];
  unreadCount: number;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
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

function tabToCategory(tabId: string): string | undefined {
  if (tabId === "all" || tabId === "unread") return tabId;
  if (tabId === "breaking") return "breaking";
  if (tabId === "topics") return "topic";
  if (tabId === "social") return "social";
  if (tabId === "saved") return "saved";
  if (tabId === "system") return "system";
  return undefined;
}

export function UserNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState("all");

  const refresh = React.useCallback(async (category = "all") => {
    const apiCategory = tabToCategory(category);
    const data = await fetchUserNotifications(apiCategory);
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

    refresh(activeCategory)
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
  }, [user?.id, activeCategory, refresh]);

  React.useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const unsubscribe = subscribeToUserNotifications(user.id as number, (payload) => {
      const incoming = mapRealtimeNotification(payload);

      if (env.isDev) {
        console.debug("[notifications] realtime event received", incoming);
      }

      setNotifications((prev) => {
        if (prev.some((item) => item.id === incoming.id)) {
          return prev;
        }
        return [incoming, ...prev];
      });

      if (incoming.unread) {
        setUnreadCount((count) => count + 1);
        toast(incoming.body ? `${incoming.title}\n${incoming.body}` : incoming.title, {
          icon: incoming.tab === "breaking" ? "🚨" : "🔔",
          duration: 5000,
        });
      }
    });

    if (env.isDev) {
      console.debug("[notifications] subscribed to private user channel", user.id);
    }

    return unsubscribe;
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
      await refresh(activeCategory);
    }
  }, [activeCategory, refresh]);

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
      await refresh(activeCategory);
    }
  }, [activeCategory, refresh]);

  const filterByTab = React.useCallback(
    (tabId: string) => {
      if (tabId === "unread") return notifications.filter((n) => n.unread);
      if (tabId === "breaking") return notifications.filter((n) => n.tab === "breaking");
      if (tabId === "topics") return notifications.filter((n) => n.tab === "topic");
      if (tabId === "social") return notifications.filter((n) => n.tab === "social");
      if (tabId === "saved") return notifications.filter((n) => n.tab === "saved");
      if (tabId === "system") return notifications.filter((n) => n.tab === "system");
      return notifications;
    },
    [notifications],
  );

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount: unreadCount || getUnreadCount(notifications),
      activeCategory,
      setActiveCategory,
      markAsRead,
      markAllAsRead,
      filterByTab,
      loading,
      refresh: () => refresh(activeCategory),
    }),
    [
      notifications,
      unreadCount,
      activeCategory,
      markAsRead,
      markAllAsRead,
      filterByTab,
      loading,
      refresh,
    ],
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
