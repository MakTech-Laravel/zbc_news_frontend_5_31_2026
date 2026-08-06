export const ADMIN_NOTIFICATION_EVENTS = [
  {
    id: "newsletter_subscription",
    label: "Newsletter subscriptions",
    description: "New subscriptions and subscriber verification activity.",
  },
  {
    id: "newsletter_campaign",
    label: "Newsletter campaigns",
    description: "Campaign completion and sent status updates.",
  },
  {
    id: "newsletter_delivery",
    label: "Newsletter delivery",
    description: "Delivered, failed, bounced, and unsubscribed events.",
  },
  {
    id: "account_activity",
    label: "Account activity",
    description: "Account deletion requests, cancellations, and restorations.",
  },
  {
    id: "comment_moderation",
    label: "Comment moderation",
    description: "New comments waiting for staff review.",
  },
  {
    id: "contact_inquiry",
    label: "Contact messages",
    description: "New submissions from the website contact form.",
  },
  {
    id: "career_application",
    label: "Career applications",
    description: "New applications submitted for open positions.",
  },
  {
    id: "task_failure",
    label: "Task failures",
    description: "Scheduled task and queue job failures.",
  },
  {
    id: "security_alert",
    label: "Security alerts",
    description: "Repeated failed login attempts and security warnings.",
  },
] as const;

export type AdminNotificationEvent = (typeof ADMIN_NOTIFICATION_EVENTS)[number]["id"];

export type AdminNotificationChannels = Record<
  AdminNotificationEvent,
  {
    dashboard: boolean;
    email: boolean;
  }
>;

export type AdminNotificationSettingsPayload = {
  settings: AdminNotificationChannels;
  admin_notification_email: string;
};

export const DEFAULT_ADMIN_NOTIFICATION_EMAIL = "newsroom@zbc.news";

export const DEFAULT_ADMIN_NOTIFICATION_CHANNELS =
  Object.fromEntries(
    ADMIN_NOTIFICATION_EVENTS.map((event) => [
      event.id,
      { dashboard: true, email: true },
    ]),
  ) as AdminNotificationChannels;
