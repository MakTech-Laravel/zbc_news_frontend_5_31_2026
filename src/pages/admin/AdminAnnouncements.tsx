import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  publishAnnouncement,
  type Announcement,
} from '@/services/admin/announcements'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<Announcement['audience']>('authenticated_only')
  const [saving, setSaving] = useState(false)

  async function loadAnnouncements() {
    setLoading(true)
    try {
      setAnnouncements(await fetchAnnouncements())
    } catch {
      toast.error('Failed to load announcements.')
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAnnouncements()
  }, [])

  async function handleCreate() {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required.')
      return
    }

    setSaving(true)
    try {
      await createAnnouncement({ title: title.trim(), body: body.trim(), audience })
      toast.success('Announcement draft created.')
      setTitle('')
      setBody('')
      await loadAnnouncements()
    } catch {
      toast.error('Failed to create announcement.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(id: number) {
    try {
      await publishAnnouncement(id)
      toast.success('Announcement published. Users will be notified in real time.')
      await loadAnnouncements()
    } catch {
      toast.error('Failed to publish announcement.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteAnnouncement(id)
      toast.success('Announcement deleted.')
      await loadAnnouncements()
    } catch {
      toast.error('Failed to delete announcement.')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Announcements"
        description="Publish platform-wide messages to opted-in users"
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-admin-heading">Create announcement</h2>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Announcement message"
          className="min-h-[120px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm"
        />
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as Announcement['audience'])}
          className="h-10 rounded-lg border border-admin-input-border bg-card px-3 text-sm"
        >
          <option value="authenticated_only">Authenticated users</option>
          <option value="all_users">All users</option>
        </select>
        <Button type="button" onClick={handleCreate} disabled={saving}>
          {saving ? 'Saving...' : 'Save draft'}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-admin-heading">All announcements</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-sm text-admin-label">Loading announcements…</p>
        ) : announcements.length === 0 ? (
          <p className="px-6 py-8 text-sm text-admin-label">No announcements yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {announcements.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
                <div className="space-y-1">
                  <p className="font-medium text-admin-heading">{item.title}</p>
                  <p className="text-sm text-admin-label line-clamp-2">{item.body}</p>
                  <p className="text-xs text-admin-label">
                    {item.status}
                    {item.published_at ? ` · ${new Date(item.published_at).toLocaleString()}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.status === 'draft' ? (
                    <Button type="button" size="sm" onClick={() => void handlePublish(item.id)}>
                      Publish
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
