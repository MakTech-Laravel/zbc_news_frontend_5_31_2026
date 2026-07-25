/**
 * Client-side rules for showing a breaking-news headline in the public ticker.
 * Mirrors backend BreakingNewsItem::isLive / scopeEligibleForTicker.
 */

export type PublicBreakingNewsRow = {
  id?: number | string
  title?: unknown
  headline?: unknown
  slug?: unknown
  status?: unknown
  is_live?: unknown
  starts_at?: unknown
  expires_at?: unknown
  priority?: unknown
  article?: {
    slug?: unknown
    title?: unknown
    status?: unknown
  } | null
}

export type LiveBreakingNewsItem = {
  id: number | string
  title: string
  slug: string
  priority: number
  status: string
  starts_at: string | null
  expires_at: string | null
  article_status: string | null
  is_live: boolean | null
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function parseDate(value: unknown): Date | null {
  if (value == null || value === '') return null
  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Returns true when this breaking item should appear on the public site.
 */
export function isLiveBreakingNewsItem(
  row: PublicBreakingNewsRow,
  now: Date = new Date(),
): boolean {
  if (row.is_live === false) return false

  const status = asTrimmedString(row.status).toLowerCase()
  // If API omits status (legacy), treat as eligible when other fields pass.
  if (status && status !== 'active') return false

  const startsAt = parseDate(row.starts_at)
  if (startsAt && startsAt.getTime() > now.getTime()) return false

  const expiresAt = parseDate(row.expires_at)
  if (expiresAt && expiresAt.getTime() <= now.getTime()) return false

  const articleStatus = asTrimmedString(row.article?.status).toLowerCase()
  if (articleStatus && articleStatus !== 'published') return false

  const title =
    asTrimmedString(row.title) ||
    asTrimmedString(row.headline) ||
    asTrimmedString(row.article?.title)
  const slug = asTrimmedString(row.slug) || asTrimmedString(row.article?.slug)

  return Boolean(title && slug)
}

export function toLiveBreakingNewsItem(
  row: PublicBreakingNewsRow,
): LiveBreakingNewsItem | null {
  const title =
    asTrimmedString(row.title) ||
    asTrimmedString(row.headline) ||
    asTrimmedString(row.article?.title)
  const slug = asTrimmedString(row.slug) || asTrimmedString(row.article?.slug)

  if (!title || !slug) return null

  const priority =
    typeof row.priority === 'number' && Number.isFinite(row.priority)
      ? row.priority
      : Number(row.priority) || 0

  return {
    id: row.id ?? slug,
    title,
    slug,
    priority,
    status: asTrimmedString(row.status).toLowerCase() || 'active',
    starts_at: asTrimmedString(row.starts_at) || null,
    expires_at: asTrimmedString(row.expires_at) || null,
    article_status: asTrimmedString(row.article?.status).toLowerCase() || null,
    is_live: typeof row.is_live === 'boolean' ? row.is_live : null,
  }
}

/**
 * Filter + sort breaking rows for the public ticker.
 */
export function filterLiveBreakingNews(
  rows: unknown,
  now: Date = new Date(),
): LiveBreakingNewsItem[] {
  if (!Array.isArray(rows)) return []

  return rows
    .filter((row): row is PublicBreakingNewsRow => Boolean(row) && typeof row === 'object')
    .filter((row) => isLiveBreakingNewsItem(row, now))
    .map((row) => toLiveBreakingNewsItem(row))
    .filter((item): item is LiveBreakingNewsItem => item !== null)
    .sort((a, b) => a.priority - b.priority || String(a.id).localeCompare(String(b.id)))
}

/** Re-validate already-mapped ticker items against the current clock. */
export function keepLiveBreakingNewsItems(
  items: LiveBreakingNewsItem[],
  now: Date = new Date(),
): LiveBreakingNewsItem[] {
  return items.filter((item) =>
    isLiveBreakingNewsItem(
      {
        id: item.id,
        title: item.title,
        slug: item.slug,
        status: item.status,
        starts_at: item.starts_at,
        expires_at: item.expires_at,
        priority: item.priority,
        is_live: item.is_live ?? undefined,
        article: item.article_status
          ? { status: item.article_status, slug: item.slug, title: item.title }
          : { slug: item.slug, title: item.title },
      },
      now,
    ),
  )
}
