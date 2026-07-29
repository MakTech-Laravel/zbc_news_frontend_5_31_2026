import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/hooks/usePermission'
import {
  CAREER_DEPARTMENTS,
  CAREER_EMPLOYMENT_TYPES,
  CAREER_JOB_STATUSES,
  createAdminCareerJob,
  fetchAdminCareerJob,
  updateAdminCareerJob,
  type CareerJobPayload,
} from '@/services/admin/careers'
import { PERMISSIONS } from '@/types/permissions'

const emptyForm: CareerJobPayload = {
  title: '',
  slug: '',
  department: 'Editorial',
  employment_type: 'Full-time',
  location: '',
  description: '',
  status: 'draft',
  sort_order: 0,
}

export default function AdminCareerJobForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { can, isSuperAdmin } = usePermission()
  const canSave =
    isSuperAdmin ||
    can(isEdit ? PERMISSIONS.CAREER_JOBS.UPDATE : PERMISSIONS.CAREER_JOBS.CREATE)

  const [form, setForm] = useState<CareerJobPayload>(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit || !id) return
    void (async () => {
      setLoading(true)
      try {
        const job = await fetchAdminCareerJob(Number(id))
        setForm({
          title: job.title,
          slug: job.slug,
          department: String(job.department),
          employment_type: String(job.employment_type),
          location: job.location,
          description: job.description ?? '',
          status: String(job.status),
          sort_order: job.sort_order ?? 0,
        })
      } catch {
        toast.error('Failed to load job.')
        navigate('/admin/careers?tab=jobs')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isEdit, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateAdminCareerJob(Number(id), form)
        toast.success('Job updated.')
      } else {
        await createAdminCareerJob(form)
        toast.success('Job created.')
      }
      navigate('/admin/careers?tab=jobs')
    } catch {
      toast.error(isEdit ? 'Failed to update job.' : 'Failed to create job.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-admin-label">Loading job…</p>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEdit ? 'Edit job' : 'Create job'}
        description="Manage an open career position"
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/careers?tab=jobs">Back</Link>
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-admin-label">Title</span>
          <Input
            value={form.title}
            disabled={!canSave}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-admin-label">Slug</span>
          <Input
            value={form.slug}
            disabled={!canSave}
            placeholder="Auto-generated from title if empty"
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Department</span>
            <select
              value={form.department}
              disabled={!canSave}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              className="h-10 w-full rounded-lg border border-admin-input-border bg-card px-3 text-sm"
            >
              {CAREER_DEPARTMENTS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Type</span>
            <select
              value={form.employment_type}
              disabled={!canSave}
              onChange={(e) =>
                setForm((f) => ({ ...f, employment_type: e.target.value }))
              }
              className="h-10 w-full rounded-lg border border-admin-input-border bg-card px-3 text-sm"
            >
              {CAREER_EMPLOYMENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Location</span>
            <Input
              value={form.location}
              disabled={!canSave}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Status</span>
            <select
              value={form.status}
              disabled={!canSave}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="h-10 w-full rounded-lg border border-admin-input-border bg-card px-3 text-sm"
            >
              {CAREER_JOB_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-admin-label">Sort order</span>
            <Input
              type="number"
              value={form.sort_order ?? 0}
              disabled={!canSave}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sort_order: Number(e.target.value) || 0,
                }))
              }
            />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-admin-label">Description</span>
          <textarea
            value={form.description ?? ''}
            disabled={!canSave}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="min-h-[140px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm"
          />
        </label>
        {canSave ? (
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update job' : 'Create job'}
          </Button>
        ) : null}
      </form>
    </div>
  )
}
