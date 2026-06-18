export type UserNotificationIcon =
  | "breaking"
  | "technology"
  | "recommended"
  | "reply"
  | "saved"
  | "business";

export type UserNotificationTab = "breaking" | "topic" | "system" | "social" | "saved";

export type UserNotification = {
  id: string;
  tab: UserNotificationTab;
  title: string;
  body: string;
  time: string;
  icon: UserNotificationIcon;
  unread?: boolean;
  showReadArticle?: boolean;
  showMarkRead?: boolean;
  articleSlug?: string | null;
};

export type UserNotificationsResponse = {
  notifications: UserNotification[];
  unreadCount: number;
};
