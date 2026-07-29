import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/usePermission'
import {
  CAREER_APPLICATION_STATUSES,
  deleteAdminCareerApplication,
  downloadAdminCareerApplicationResume,
  fetchAdminCareerApplication,
  updateAdminCareerApplicationStatus,
  type CareerApplication,
} from '@/services/admin/careers'
import { PERMISSIONS } from '@/types/permissions'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminCareerApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { can, isSuperAdmin } = usePermission()
  const canUpdate = isSuperAdmin || can(PERMISSIONS.CAREER_APPLICATIONS.UPDATE)
  const canDelete = isSuperAdmin || can(PERMISSIONS.CAREER_APPLICATIONS.DELETE)

  const [application, setApplication] = useState<CareerApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchAdminCareerApplication(Number(id))
        setApplication(data)
        setStatus(String(data.status))
      } catch {
        toast.error('Failed to load application.')
        navigate('/admin/careers?tab=applications')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate])

  if (loading) {
    return <p className="text-sm text-admin-label">Loading application…</p>
  }

  if (!application) return null

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={application.name}
        description={application.job?.title ?? 'Career application'}
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/careers?tab=applications">Back</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-admin-label">Email</dt>
              <dd className="font-medium text-admin-heading">{application.email}</dd>
            </div>
            <div>
              <dt className="text-admin-label">Phone</dt>
              <dd className="font-medium text-admin-heading">
                {application.phone || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-admin-label">Job</dt>
              <dd className="font-medium text-admin-heading">
                {application.job?.title ?? `#${application.career_job_id}`}
              </dd>
            </div>
            <div>
              <dt className="text-admin-label">Submitted</dt>
              <dd className="font-medium text-admin-heading">
                {application.created_at
                  ? new Date(application.created_at).toLocaleString()
                  : '—'}
              </dd>
            </div>
          </dl>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-admin-heading">
              Cover letter
            </h2>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 text-sm text-admin-heading">
              {application.cover_letter || 'No cover letter provided.'}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-admin-heading">Status</h2>
            <select
              value={status}
              disabled={!canUpdate}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-admin-input-border bg-card px-3 text-sm"
            >
              {CAREER_APPLICATION_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {canUpdate ? (
              <Button
                type="button"
                className="mt-3 w-full"
                onClick={async () => {
                  try {
                    const updated = await updateAdminCareerApplicationStatus(
                      application.id,
                      status,
                    )
                    setApplication(updated)
                    toast.success('Status updated.')
                  } catch {
                    toast.error('Failed to update status.')
                  }
                }}
              >
                Update status
              </Button>
            ) : null}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-admin-heading">Resume</h2>
            <p className="mb-3 text-sm text-admin-label">
              {application.resume_original_name || 'Resume file'}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  const blob = await downloadAdminCareerApplicationResume(
                    application.id,
                  )
                  downloadBlob(
                    blob,
                    application.resume_original_name || 'resume.pdf',
                  )
                } catch {
                  toast.error('Failed to download resume.')
                }
              }}
            >
              Download resume
            </Button>
          </div>

          {canDelete ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  await deleteAdminCareerApplication(application.id)
                  toast.success('Application deleted.')
                  navigate('/admin/careers?tab=applications')
                } catch {
                  toast.error('Failed to delete application.')
                }
              }}
            >
              Delete application
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
