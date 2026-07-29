import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/hooks/usePermission'
import {
  CAREER_APPLICATION_STATUSES,
  bulkAdminCareerApplicationAction,
  fetchAdminCareerApplications,
  fetchAdminCareerJobs,
  type CareerApplication,
  type CareerJob,
} from '@/services/admin/careers'
import { PERMISSIONS } from '@/types/permissions'

export function CareersApplicationsTab() {
  const { can, isSuperAdmin } = usePermission()
  const canBulk = isSuperAdmin || can(PERMISSIONS.CAREER_APPLICATIONS.BULK)

  const [applications, setApplications] = useState<CareerApplication[]>([])
  const [jobs, setJobs] = useState<CareerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [jobId, setJobId] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [selected, setSelected] = useState<number[]>([])

  async function load() {
    setLoading(true)
    try {
      const result = await fetchAdminCareerApplications({
        search: search || undefined,
        status: status || undefined,
        career_job_id: jobId ? Number(jobId) : undefined,
        page,
      })
      setApplications(result.applications)
      setLastPage(result.meta.last_page)
      setSelected([])
    } catch {
      toast.error('Failed to load applications.')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const result = await fetchAdminCareerJobs({ per_page: 50 })
        setJobs(result.jobs)
      } catch {
        setJobs([])
      }
    })()
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, jobId])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1)
                void load()
              }
            }}
          />
          <select
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
            className="h-10 rounded-lg border border-admin-input-border bg-card px-3 text-sm"
          >
            <option value="">All statuses</option>
            {CAREER_APPLICATION_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={jobId}
            onChange={(e) => {
              setPage(1)
              setJobId(e.target.value)
            }}
            className="h-10 rounded-lg border border-admin-input-border bg-card px-3 text-sm"
          >
            <option value="">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPage(1)
              void load()
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {canBulk && selected.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/40 p-3">
          {(
            [
              ['mark_reviewed', 'Mark reviewed'],
              ['shortlist', 'Shortlist'],
              ['reject', 'Reject'],
              ['archive', 'Archive'],
              ['delete', 'Delete'],
            ] as const
          ).map(([action, label]) => (
            <Button
              key={action}
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await bulkAdminCareerApplicationAction(action, selected)
                  toast.success('Bulk action completed.')
                  void load()
                } catch {
                  toast.error('Bulk action failed.')
                }
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p className="px-6 py-8 text-sm text-admin-label">Loading applications…</p>
        ) : applications.length === 0 ? (
          <p className="px-6 py-8 text-sm text-admin-label">No applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-admin-label">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        applications.length > 0 &&
                        selected.length === applications.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? applications.map((item) => item.id)
                            : [],
                        )
                      }
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(application.id)}
                        onChange={(e) =>
                          setSelected((ids) =>
                            e.target.checked
                              ? [...ids, application.id]
                              : ids.filter((id) => id !== application.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-admin-heading">
                        {application.name}
                      </div>
                      <div className="text-admin-label">{application.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {application.job?.title ?? `#${application.career_job_id}`}
                    </td>
                    <td className="px-4 py-3 capitalize">{application.status}</td>
                    <td className="px-4 py-3">
                      {application.created_at
                        ? new Date(application.created_at).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/careers/applications/${application.id}`}
                        className="text-sm font-medium text-zbc-red hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lastPage > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-admin-label">
            Page {page} of {lastPage}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
