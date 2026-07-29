import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePermission } from '@/hooks/usePermission'
import {
  CAREER_DEPARTMENTS,
  CAREER_JOB_STATUSES,
  deleteAdminCareerJob,
  fetchAdminCareerJobs,
  forceDeleteAdminCareerJob,
  restoreAdminCareerJob,
  type CareerJob,
} from '@/services/admin/careers'
import { PERMISSIONS } from '@/types/permissions'

export function CareersJobsTab() {
  const { can, isSuperAdmin } = usePermission()
  const canCreate = isSuperAdmin || can(PERMISSIONS.CAREER_JOBS.CREATE)
  const canUpdate = isSuperAdmin || can(PERMISSIONS.CAREER_JOBS.UPDATE)
  const canDelete = isSuperAdmin || can(PERMISSIONS.CAREER_JOBS.DELETE)
  const canRestore = isSuperAdmin || can(PERMISSIONS.CAREER_JOBS.RESTORE)
  const canForce = isSuperAdmin || can(PERMISSIONS.CAREER_JOBS.FORCE_DELETE)

  const [jobs, setJobs] = useState<CareerJob[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')
  const [trashed, setTrashed] = useState(false)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  async function load() {
    setLoading(true)
    try {
      const result = await fetchAdminCareerJobs({
        search: search || undefined,
        status: status || undefined,
        department: department || undefined,
        trashed,
        page,
      })
      setJobs(result.jobs)
      setLastPage(result.meta.last_page)
    } catch {
      toast.error('Failed to load career jobs.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, department, trashed])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
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
            {CAREER_JOB_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={department}
            onChange={(e) => {
              setPage(1)
              setDepartment(e.target.value)
            }}
            className="h-10 rounded-lg border border-admin-input-border bg-card px-3 text-sm"
          >
            <option value="">All departments</option>
            {CAREER_DEPARTMENTS.map((value) => (
              <option key={value} value={value}>
                {value}
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
          <Button
            type="button"
            variant={trashed ? 'default' : 'outline'}
            onClick={() => {
              setPage(1)
              setTrashed((v) => !v)
            }}
          >
            {trashed ? 'Viewing trash' : 'Trash'}
          </Button>
          {canCreate && !trashed ? (
            <Button asChild>
              <Link to="/admin/careers/jobs/create">Add job</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p className="px-6 py-8 text-sm text-admin-label">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-admin-label">No jobs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-admin-label">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-admin-heading">
                      {job.title}
                    </td>
                    <td className="px-4 py-3">{job.department}</td>
                    <td className="px-4 py-3">{job.employment_type}</td>
                    <td className="px-4 py-3">{job.location}</td>
                    <td className="px-4 py-3 capitalize">{job.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {!trashed && canUpdate ? (
                          <Link
                            to={`/admin/careers/jobs/${job.id}/edit`}
                            className="text-sm font-medium text-zbc-red hover:underline"
                          >
                            Edit
                          </Link>
                        ) : null}
                        {!trashed && canDelete ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-admin-label hover:underline"
                            onClick={async () => {
                              try {
                                await deleteAdminCareerJob(job.id)
                                toast.success('Job moved to trash.')
                                void load()
                              } catch {
                                toast.error('Failed to delete job.')
                              }
                            }}
                          >
                            Delete
                          </button>
                        ) : null}
                        {trashed && canRestore ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-zbc-red hover:underline"
                            onClick={async () => {
                              try {
                                await restoreAdminCareerJob(job.id)
                                toast.success('Job restored.')
                                void load()
                              } catch {
                                toast.error('Failed to restore job.')
                              }
                            }}
                          >
                            Restore
                          </button>
                        ) : null}
                        {trashed && canForce ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-admin-label hover:underline"
                            onClick={async () => {
                              try {
                                await forceDeleteAdminCareerJob(job.id)
                                toast.success('Job permanently deleted.')
                                void load()
                              } catch {
                                toast.error('Failed to permanently delete job.')
                              }
                            }}
                          >
                            Force delete
                          </button>
                        ) : null}
                      </div>
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
