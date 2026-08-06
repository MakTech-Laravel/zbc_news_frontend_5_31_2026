import { request } from "@/api/request";
import type {
  AdminNotificationChannels,
  AdminNotificationSettingsPayload,
} from "@/types/adminNotificationSettings";
import { DEFAULT_ADMIN_NOTIFICATION_EMAIL } from "@/types/adminNotificationSettings";

function extractPayload(body: unknown): AdminNotificationSettingsPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid notification settings response");
  }

  const root = body as {
    data?: {
      settings?: AdminNotificationChannels;
      admin_notification_email?: string;
    };
    settings?: AdminNotificationChannels;
    admin_notification_email?: string;
  };

  const settings = root.data?.settings ?? root.settings;
  const email =
    root.data?.admin_notification_email ??
    root.admin_notification_email ??
    DEFAULT_ADMIN_NOTIFICATION_EMAIL;

  if (!settings) {
    throw new Error("Notification settings are missing");
  }

  return {
    settings,
    admin_notification_email: email.trim() || DEFAULT_ADMIN_NOTIFICATION_EMAIL,
  };
}

export async function fetchAdminNotificationSettings(): Promise<AdminNotificationSettingsPayload> {
  const response = await request.get("/admin/admin-notification-settings");
  return extractPayload(response.data);
}

export async function updateAdminNotificationSettings(
  payload: AdminNotificationSettingsPayload,
): Promise<AdminNotificationSettingsPayload> {
  const response = await request.put("/admin/admin-notification-settings", {
    settings: payload.settings,
    admin_notification_email: payload.admin_notification_email,
  });
  return extractPayload(response.data);
}
