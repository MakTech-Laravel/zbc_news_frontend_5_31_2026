import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { AdminFilterBar } from '@/components/admin/shared/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  activateBreakingNewsItem,
  fetchBreakingNewsItems,
  pauseBreakingNewsItem,
  removeBreakingNewsItem,
  reorderBreakingNewsItems,
  updateBreakingNewsItem,
  type BreakingNewsItem,
} from '@/services/admin/breakingNews'
import { toApiDatetimeValue, toDatetimeLocalValue } from '@/lib/datetime'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
]

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function statusBadgeClass(status: string, isLive: boolean): string {
  if (isLive) return 'bg-emerald-100 text-emerald-800'
  if (status === 'paused') return 'bg-amber-100 text-amber-800'
  if (status === 'expired') return 'bg-zinc-200 text-zinc-700'
  if (status === 'active') return 'bg-sky-100 text-sky-800'
  return 'bg-muted text-admin-label'
}

function statusLabel(item: BreakingNewsItem): string {
  if (item.is_live) return 'Live'
  if (item.status === 'active' && item.starts_at && new Date(item.starts_at) > new Date()) {
    return 'Scheduled'
  }
  if (item.status === 'active') return 'Active'
  if (item.status === 'paused') return 'Paused'
  if (item.status === 'expired') return 'Expired'
  return item.status
}

export default function AdminBreakingNews() {
  const [items, setItems] = useState<BreakingNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [editing, setEditing] = useState<BreakingNewsItem | null>(null)
  const [editPriority, setEditPriority] = useState('10')
  const [editHeadline, setEditHeadline] = useState('')
  const [editStartsAt, setEditStartsAt] = useState('')
  const [editExpiresAt, setEditExpiresAt] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  async function loadItems(nextSearch = search, nextStatus = statusFilter) {
    setLoading(true)
    try {
      setItems(
        await fetchBreakingNewsItems({
          search: nextSearch.trim() || undefined,
          status: nextStatus,
        }),
      )
    } catch {
      toast.error('Failed to load breaking news.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadItems(search, statusFilter)
    }, 250)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter])

  const orderedIds = useMemo(() => items.map((item) => item.id), [items])

  function openEdit(item: BreakingNewsItem) {
    setEditing(item)
    setEditPriority(String(item.priority))
    setEditHeadline(item.headline_override ?? '')
    setEditStartsAt(toDatetimeLocalValue(item.starts_at))
    setEditExpiresAt(toDatetimeLocalValue(item.expires_at))
  }

  async function handleSaveEdit() {
    if (!editing) return
    setSavingEdit(true)
    try {
      await updateBreakingNewsItem(editing.id, {
        priority: Number(editPriority) || 0,
        headline_override: editHeadline.trim() || null,
        starts_at: editStartsAt.trim() ? toApiDatetimeValue(editStartsAt) : null,
        expires_at: editExpiresAt.trim() ? toApiDatetimeValue(editExpiresAt) : null,
      })
      toast.success('Breaking news updated.')
      setEditing(null)
      await loadItems()
    } catch {
      toast.error('Failed to update breaking news.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleActivate(id: number) {
    setBusyId(id)
    try {
      await activateBreakingNewsItem(id)
      toast.success('Breaking news activated.')
      await loadItems()
    } catch {
      toast.error('Failed to activate.')
    } finally {
      setBusyId(null)
    }
  }

  async function handlePause(id: number) {
    setBusyId(id)
    try {
      await pauseBreakingNewsItem(id)
      toast.success('Breaking news paused.')
      await loadItems()
    } catch {
      toast.error('Failed to pause.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleRemove(id: number) {
    setBusyId(id)
    try {
      await removeBreakingNewsItem(id)
      toast.success('Removed from breaking news. Article was not deleted.')
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      toast.error('Failed to remove.')
    } finally {
      setBusyId(null)
    }
  }

  async function moveItem(id: number, direction: -1 | 1) {
    const index = orderedIds.indexOf(id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= orderedIds.length) return

    const next = [...orderedIds]
    ;[next[index], next[target]] = [next[target], next[index]]

    setBusyId(id)
    try {
      setItems(await reorderBreakingNewsItems(next))
      toast.success('Order updated.')
    } catch {
      toast.error('Failed to reorder.')
      await loadItems()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Breaking news"
        description="Control ticker order, schedule, pause, and remove without changing the original article."
        actions={
          <Button asChild>
            <Link to="/admin/articles/create">Create article</Link>
          </Button>
        }
      />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search headline or article…"
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={STATUS_FILTER_OPTIONS}
        showCategoryFilter={false}
      />

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-heading">Ticker slots</h2>
          <p className="text-sm text-admin-label">
            {loading ? 'Loading…' : `${items.length} item${items.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {loading ? (
          <p className="px-6 py-8 text-sm text-admin-label">Loading breaking news…</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-8 text-sm text-admin-label">
            No breaking news items. Enable breaking news while creating or editing an article.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item, index) => {
              const slug = item.article?.slug ?? item.slug
              const articleTitle = item.article?.title ?? item.headline

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-admin-label">
                        #{item.priority}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(item.status, item.is_live)}`}
                      >
                        {statusLabel(item)}
                      </span>
                    </div>
                    <p className="font-medium text-admin-heading">{item.headline}</p>
                    <p className="text-sm text-admin-label">
                      Article: {articleTitle}
                      {item.article?.status ? ` · ${item.article.status}` : ''}
                      {item.article?.category?.title
                        ? ` · ${item.article.category.title}`
                        : ''}
                    </p>
                    <p className="text-xs text-admin-label">
                      Starts {formatWhen(item.starts_at)} · Expires {formatWhen(item.expires_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === item.id || index === 0}
                      onClick={() => void moveItem(item.id, -1)}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === item.id || index === items.length - 1}
                      onClick={() => void moveItem(item.id, 1)}
                    >
                      Down
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    {slug ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/articles/edit/${encodeURIComponent(slug)}`}>Article</Link>
                      </Button>
                    ) : null}
                    {item.status === 'paused' || item.status === 'expired' ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => void handleActivate(item.id)}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id || item.status !== 'active'}
                        onClick={() => void handlePause(item.id)}
                      >
                        Pause
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId === item.id}
                      onClick={() => void handleRemove(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-admin-heading">Edit breaking news</h3>
            <p className="text-sm text-admin-label">{editing.headline}</p>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-admin-label">Priority</label>
              <Input
                type="number"
                min={0}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
              />
              <p className="text-xs text-admin-label">Lower numbers appear first in the ticker.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-admin-label">
                Headline override (optional)
              </label>
              <Input
                value={editHeadline}
                onChange={(e) => setEditHeadline(e.target.value)}
                placeholder="Leave blank to use article title"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-admin-label">Starts at</label>
                <Input
                  type="datetime-local"
                  step={60}
                  value={editStartsAt}
                  onChange={(e) => setEditStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-admin-label">Expires at</label>
                <Input
                  type="datetime-local"
                  step={60}
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="button" disabled={savingEdit} onClick={() => void handleSaveEdit()}>
                {savingEdit ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
