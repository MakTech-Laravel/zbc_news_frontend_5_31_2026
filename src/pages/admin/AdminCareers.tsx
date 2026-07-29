import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

import { CareersApplicationsTab } from '@/components/admin/careers/CareersApplicationsTab'
import { CareersJobsTab } from '@/components/admin/careers/CareersJobsTab'
import { CareersPageContentTab } from '@/components/admin/careers/CareersPageContentTab'
import { AdminPageHeader } from '@/components/admin/shared/AdminPageHeader'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'
import { PERMISSIONS } from '@/types/permissions'

type CareersTab = 'page' | 'jobs' | 'applications'

export default function AdminCareers() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { can, isSuperAdmin } = usePermission()

  const canPage = isSuperAdmin || can(PERMISSIONS.CAREERS_PAGE.SHOW)
  const canJobs = isSuperAdmin || can(PERMISSIONS.CAREER_JOBS.LIST)
  const canApps = isSuperAdmin || can(PERMISSIONS.CAREER_APPLICATIONS.LIST)

  const tabs = useMemo(() => {
    const items: { id: CareersTab; label: string }[] = []
    if (canPage) items.push({ id: 'page', label: 'Page Content' })
    if (canJobs) items.push({ id: 'jobs', label: 'Open Positions' })
    if (canApps) items.push({ id: 'applications', label: 'Applications' })
    return items
  }, [canPage, canJobs, canApps])

  const requested = searchParams.get('tab') as CareersTab | null
  const activeTab: CareersTab =
    requested && tabs.some((t) => t.id === requested)
      ? requested
      : (tabs[0]?.id ?? 'jobs')

  function setTab(tab: CareersTab) {
    navigate(tab === tabs[0]?.id ? '/admin/careers' : `/admin/careers?tab=${tab}`)
  }

  if (tabs.length === 0) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Careers"
          description="You do not have permission to manage careers."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Careers"
        description="Manage careers page content, open roles, and applications"
        actions={
          activeTab === 'page' ? (
            <Link
              to="/admin/settings/seo/careers"
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-admin-heading hover:bg-muted"
            >
              Edit SEO
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-zbc-red text-white'
                : 'bg-muted text-admin-heading hover:bg-muted/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'page' ? <CareersPageContentTab /> : null}
      {activeTab === 'jobs' ? <CareersJobsTab /> : null}
      {activeTab === 'applications' ? <CareersApplicationsTab /> : null}
    </div>
  )
}
