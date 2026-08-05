import { request } from "@/api/request";
import type { AdminNotificationChannels } from "@/types/adminNotificationSettings";

function extractSettings(body: unknown): AdminNotificationChannels {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid notification settings response");
  }

  const root = body as {
    data?: { settings?: AdminNotificationChannels };
    settings?: AdminNotificationChannels;
  };
  const settings = root.data?.settings ?? root.settings;

  if (!settings) {
    throw new Error("Notification settings are missing");
  }

  return settings;
}

export async function fetchAdminNotificationSettings(): Promise<AdminNotificationChannels> {
  const response = await request.get("/admin/admin-notification-settings");
  return extractSettings(response.data);
}

export async function updateAdminNotificationSettings(
  settings: AdminNotificationChannels,
): Promise<AdminNotificationChannels> {
  const response = await request.put("/admin/admin-notification-settings", { settings });
  return extractSettings(response.data);
}
