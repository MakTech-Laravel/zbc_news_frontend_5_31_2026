import * as React from "react";

import { fetchUserNotifications, getUnreadCount } from "@/services/user/notifications";
import type { UserNotification } from "@/types/user";

type UserNotificationsContextValue = {
  notifications: UserNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  filterByTab: (tabId: string) => UserNotification[];
  loading: boolean;
};

const UserNotificationsContext = React.createContext<UserNotificationsContextValue | null>(
  null,
);

export function UserNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<UserNotification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    fetchUserNotifications().then((data) => {
      if (!cancelled) {
        setNotifications(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = getUnreadCount(notifications);

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, unread: false, showMarkRead: false, showReadArticle: false }
          : n,
      ),
    );
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        unread: false,
        showMarkRead: false,
        showReadArticle: false,
      })),
    );
  }, []);

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
      unreadCount,
      markAsRead,
      markAllAsRead,
      filterByTab,
      loading,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, filterByTab, loading],
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
