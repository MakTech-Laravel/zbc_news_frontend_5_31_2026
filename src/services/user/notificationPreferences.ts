import { request } from '@/api/request'
import type { NotificationPreferences } from '@/types/notificationPreferences'

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await request.get('/admin/notification-preferences')
  return response.data.data as NotificationPreferences
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  const response = await request.put('/admin/notification-preferences/update', preferences)
  return response.data.data as NotificationPreferences
}
