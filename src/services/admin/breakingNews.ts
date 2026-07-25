import { request } from '@/api/request'

export type BreakingNewsItemStatus = 'active' | 'paused' | 'expired' | 'removed'

export type BreakingNewsItem = {
  id: number
  article_id: number
  headline: string
  headline_override: string | null
  priority: number
  status: BreakingNewsItemStatus
  starts_at: string | null
  expires_at: string | null
  is_live: boolean
  title?: string
  slug?: string | null
  article?: {
    id: number
    title: string
    slug: string
    status: string
    published_at: string | null
    category?: { id: number; title: string; slug: string } | null
    user?: { id: number; name: string } | null
  } | null
}

export type BreakingNewsPayload = {
  article_id?: number
  enabled?: boolean
  headline_override?: string | null
  priority?: number
  status?: 'active' | 'paused'
  starts_at?: string | null
  expires_at?: string | null
}

export async function fetchBreakingNewsItems(params?: {
  status?: string
  search?: string
}): Promise<BreakingNewsItem[]> {
  const response = await request.get('/admin/breaking-news', { params })
  const rows = response.data.data
  return Array.isArray(rows) ? rows : []
}

export async function createBreakingNewsItem(
  payload: BreakingNewsPayload,
): Promise<BreakingNewsItem> {
  const response = await request.post('/admin/breaking-news/store', payload)
  return response.data.data as BreakingNewsItem
}

export async function updateBreakingNewsItem(
  id: number,
  payload: BreakingNewsPayload,
): Promise<BreakingNewsItem> {
  const response = await request.put(`/admin/breaking-news/update/${id}`, payload)
  return response.data.data as BreakingNewsItem
}

export async function activateBreakingNewsItem(id: number): Promise<BreakingNewsItem> {
  const response = await request.post(`/admin/breaking-news/activate/${id}`)
  return response.data.data as BreakingNewsItem
}

export async function pauseBreakingNewsItem(id: number): Promise<BreakingNewsItem> {
  const response = await request.post(`/admin/breaking-news/pause/${id}`)
  return response.data.data as BreakingNewsItem
}

export async function removeBreakingNewsItem(id: number): Promise<void> {
  await request.delete(`/admin/breaking-news/delete/${id}`)
}

export async function reorderBreakingNewsItems(ids: number[]): Promise<BreakingNewsItem[]> {
  const response = await request.post('/admin/breaking-news/reorder', { ids })
  const rows = response.data.data
  return Array.isArray(rows) ? rows : []
}
