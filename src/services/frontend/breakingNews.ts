import { request } from '@/api/request'
import {
  filterLiveBreakingNews,
  type LiveBreakingNewsItem,
  type PublicBreakingNewsRow,
} from '@/lib/breakingNews'

export type { LiveBreakingNewsItem, PublicBreakingNewsRow }

/**
 * Fetch public breaking news and keep only items that are live on the client:
 * active status, within start/expire window, published article, valid title/slug.
 */
export async function fetchPublicBreakingNews(
  limit = 10,
  now: Date = new Date(),
): Promise<LiveBreakingNewsItem[]> {
  const response = await request.get('/articles/breaking', {
    params: { limit },
  })
  const rows = response.data?.data
  return filterLiveBreakingNews(rows, now).slice(0, Math.min(Math.max(limit, 1), 10))
}
