import { request } from '@/api/request'

export type Announcement = {
  id: number
  title: string
  body: string
  audience: 'all_users' | 'authenticated_only'
  status: 'draft' | 'published' | 'scheduled'
  published_at: string | null
  created_by: number | null
  author_name?: string | null
  created_at?: string
  updated_at?: string
}

export type AnnouncementPayload = {
  title: string
  body: string
  audience?: Announcement['audience']
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const response = await request.get('/admin/announcements')
  const rows = response.data.data
  return Array.isArray(rows) ? rows : []
}

export async function createAnnouncement(payload: AnnouncementPayload): Promise<Announcement> {
  const response = await request.post('/admin/announcements/store', payload)
  return response.data.data as Announcement
}

export async function updateAnnouncement(
  id: number,
  payload: AnnouncementPayload,
): Promise<Announcement> {
  const response = await request.put(`/admin/announcements/update/${id}`, payload)
  return response.data.data as Announcement
}

export async function publishAnnouncement(id: number): Promise<Announcement> {
  const response = await request.post(`/admin/announcements/publish/${id}`)
  return response.data.data as Announcement
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await request.delete(`/admin/announcements/delete/${id}`)
}
