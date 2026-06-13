import { unwrapLaravelData } from '@/api/laravelResponse'
import { request } from '@/api/request'
import { resolveMediaUrl } from '@/lib/mediaUrl'

export type AdminMediaRow = {
  uuid: string
  name: string
  fileName: string
  mimeType: string
  size: number | null
  url: string
  createdAt: string
  collectionName: string | null
}

export type AdminMediaListResult = {
  items: AdminMediaRow[]
  total: number
  lastPage: number
  currentPage: number
}

export type MediaSignedParams = Record<string, string | number | boolean>

export type MediaTransformPayload = {
  width?: number
  height?: number
  quality?: number
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
}

function formatMediaDate(value: unknown): string {
  if (typeof value !== 'string' || !value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatAdminMediaSize(row: AdminMediaRow): string {
  return formatFileSize(row.size)
}

function resolveMediaUrlFromRaw(raw: Record<string, unknown>): string {
  const candidates = [
    raw.url,
    raw.full_url,
    raw.original_url,
    raw.preview_url,
    raw.path,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return resolveMediaUrl(c)
  }
  return ''
}

export function normalizeAdminMedia(raw: Record<string, unknown>): AdminMediaRow | null {
  const uuid =
    (typeof raw.uuid === 'string' && raw.uuid) ||
    (typeof raw.id === 'string' && raw.id) ||
    (raw.id != null ? String(raw.id) : '')
  if (!uuid) return null

  const fileName =
    (typeof raw.file_name === 'string' && raw.file_name) ||
    (typeof raw.filename === 'string' && raw.filename) ||
    (typeof raw.name === 'string' && raw.name) ||
    'file'

  const name =
    (typeof raw.name === 'string' && raw.name) ||
    fileName

  const mimeType =
    (typeof raw.mime_type === 'string' && raw.mime_type) ||
    (typeof raw.mimeType === 'string' && raw.mimeType) ||
    ''

  const sizeRaw = raw.size ?? raw.file_size
  const size =
    typeof sizeRaw === 'number'
      ? sizeRaw
      : typeof sizeRaw === 'string' && sizeRaw
        ? Number(sizeRaw)
        : null

  return {
    uuid,
    name,
    fileName,
    mimeType,
    size: size != null && !Number.isNaN(size) ? size : null,
    url: resolveMediaUrlFromRaw(raw),
    createdAt: formatMediaDate(raw.created_at),
    collectionName:
      typeof raw.collection_name === 'string' ? raw.collection_name : null,
  }
}

function unwrapMediaList(payload: unknown): AdminMediaListResult {
  const body = unwrapLaravelData(payload) ?? payload
  let items: unknown[] = []
  let total = 0
  let lastPage = 1
  let currentPage = 1

  if (Array.isArray(body)) {
    items = body
    total = body.length
  } else if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    if (Array.isArray(o.data)) items = o.data
    else if (Array.isArray(o.items)) items = o.items
    else if (Array.isArray(o.media)) items = o.media

    const meta =
      o.meta && typeof o.meta === 'object'
        ? (o.meta as Record<string, unknown>)
        : null
    if (meta) {
      total = typeof meta.total === 'number' ? meta.total : items.length
      lastPage = typeof meta.last_page === 'number' ? meta.last_page : 1
      currentPage = typeof meta.current_page === 'number' ? meta.current_page : 1
    } else {
      total = items.length
    }
  }

  const normalized = items
    .map((item) =>
      item && typeof item === 'object'
        ? normalizeAdminMedia(item as Record<string, unknown>)
        : null,
    )
    .filter((row): row is AdminMediaRow => row !== null)

  return {
    items: normalized,
    total: total || normalized.length,
    lastPage,
    currentPage,
  }
}

export type FetchAdminMediaParams = {
  page?: number
  per_page?: number
  search?: string
}

export async function fetchAdminMedia(
  params?: FetchAdminMediaParams,
): Promise<AdminMediaListResult> {
  const response = await request.get('/admin/media', { params })
  return unwrapMediaList(response.data)
}

export async function fetchAdminMediaItem(uuid: string): Promise<AdminMediaRow | null> {
  const response = await request.get(`/admin/media/show/${uuid}`)
  const data = unwrapLaravelData(response.data) ?? response.data
  if (!data || typeof data !== 'object') return null
  return normalizeAdminMedia(data as Record<string, unknown>)
}

export async function uploadAdminMedia(file: File): Promise<AdminMediaRow | null> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await request.post('/admin/media/store', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  const data = unwrapLaravelData(response.data) ?? response.data
  if (!data || typeof data !== 'object') return null
  return normalizeAdminMedia(data as Record<string, unknown>)
}

export async function deleteAdminMedia(uuid: string): Promise<void> {
  await request.delete(`/admin/media/delete/${uuid}`)
}

export type AdminMediaBulkDeleteResult = {
  deleted: number
  skipped_not_found: string[]
  skipped_failed: string[]
}

export async function bulkDeleteAdminMedia(
  uuids: string[],
): Promise<AdminMediaBulkDeleteResult> {
  const response = await request.delete('/admin/media/bulk', {
    data: { ids: uuids },
  })
  const data = unwrapLaravelData(response.data) ?? response.data
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    return {
      deleted: typeof o.deleted === 'number' ? o.deleted : 0,
      skipped_not_found: Array.isArray(o.skipped_not_found)
        ? o.skipped_not_found.filter((id): id is string => typeof id === 'string')
        : [],
      skipped_failed: Array.isArray(o.skipped_failed)
        ? o.skipped_failed.filter((id): id is string => typeof id === 'string')
        : [],
    }
  }
  return { deleted: 0, skipped_not_found: [], skipped_failed: [] }
}

export async function fetchMediaSignedParams(
  params?: Record<string, string>,
): Promise<MediaSignedParams | null> {
  const response = await request.get('/admin/media/signed-params', { params })
  const data = unwrapLaravelData(response.data) ?? response.data
  if (!data || typeof data !== 'object') return null
  return data as MediaSignedParams
}

export async function transformAdminMedia(
  uuid: string,
  payload: MediaTransformPayload,
): Promise<AdminMediaRow | null> {
  const response = await request.post(`/admin/media/transform/${uuid}`, payload)
  const data = unwrapLaravelData(response.data) ?? response.data
  if (!data || typeof data !== 'object') return null
  return normalizeAdminMedia(data as Record<string, unknown>)
}

export function isImageMedia(row: AdminMediaRow): boolean {
  return row.mimeType.startsWith('image/')
}

export function isVideoMedia(row: AdminMediaRow): boolean {
  return row.mimeType.startsWith('video/')
}
