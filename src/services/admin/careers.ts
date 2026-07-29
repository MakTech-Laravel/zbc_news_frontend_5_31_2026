import { api } from '@/api/client'
import { request } from '@/api/request'

export type CareersPageContent = {
  id?: number
  hero: {
    badge: string
    headline: string
    subheadline: string
    primary_cta: string
    secondary_cta: string
  }
  stats: { value: string; label: string }[]
  perks_section: { eyebrow: string; heading: string }
  perks: { icon?: string; emoji?: string; title: string; description: string }[]
  positions_section: {
    eyebrow: string
    heading: string
    search_placeholder: string
  }
  hiring_section: { eyebrow: string; heading: string }
  hiring_steps: { number: string; title: string; description: string }[]
  testimonials_section: { eyebrow: string; heading: string }
  testimonials: {
    quote: string
    initials: string
    name: string
    role: string
    rating: number
  }[]
  faq_section: { eyebrow: string; heading: string }
  faqs: { question: string; answer: string }[]
  cta: {
    heading: string
    description: string
    button: string
    button_url: string
  }
  updated_at?: string
}

export type CareerJobStatus = 'draft' | 'published' | 'closed'
export type CareerJobDepartment =
  | 'Editorial'
  | 'Engineering'
  | 'Multimedia'
  | 'Audience'
  | 'Commercial'
export type CareerEmploymentType = 'Full-time' | 'Contract'

export type CareerJob = {
  id: number
  title: string
  slug: string
  department: CareerJobDepartment | string
  employment_type: CareerEmploymentType | string
  type?: string
  location: string
  description?: string | null
  status: CareerJobStatus | string
  sort_order: number
  published_at?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  applications_count?: number
}

export type CareerJobPayload = {
  title: string
  slug?: string
  department: string
  employment_type: string
  location: string
  description?: string | null
  status: string
  sort_order?: number
}

export type CareerApplicationStatus =
  | 'new'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'archived'

export type CareerApplication = {
  id: number
  career_job_id: number
  job?: {
    id: number
    title: string
    slug: string
    department?: string
  } | null
  name: string
  email: string
  phone?: string | null
  cover_letter?: string | null
  resume_original_name?: string
  resume_mime?: string | null
  resume_size?: number | null
  status: CareerApplicationStatus | string
  ip_address?: string | null
  created_at?: string
  updated_at?: string
}

export type PaginatedMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const CAREER_DEPARTMENTS: CareerJobDepartment[] = [
  'Editorial',
  'Engineering',
  'Multimedia',
  'Audience',
  'Commercial',
]

export const CAREER_EMPLOYMENT_TYPES: CareerEmploymentType[] = [
  'Full-time',
  'Contract',
]

export const CAREER_JOB_STATUSES: CareerJobStatus[] = [
  'draft',
  'published',
  'closed',
]

export const CAREER_APPLICATION_STATUSES: CareerApplicationStatus[] = [
  'new',
  'reviewed',
  'shortlisted',
  'rejected',
  'archived',
]

function asMeta(meta: unknown): PaginatedMeta {
  const m = (meta ?? {}) as Record<string, unknown>
  return {
    current_page: Number(m.current_page ?? 1),
    last_page: Number(m.last_page ?? 1),
    per_page: Number(m.per_page ?? 15),
    total: Number(m.total ?? 0),
  }
}

export async function fetchAdminCareersPage(): Promise<CareersPageContent> {
  const response = await request.get('/admin/careers/page')
  return response.data.data as CareersPageContent
}

export async function updateAdminCareersPage(
  payload: CareersPageContent,
): Promise<CareersPageContent> {
  const response = await request.put('/admin/careers/page', payload)
  return response.data.data as CareersPageContent
}

export async function fetchAdminCareerJobs(params?: {
  status?: string
  department?: string
  search?: string
  trashed?: boolean
  page?: number
  per_page?: number
}): Promise<{ jobs: CareerJob[]; meta: PaginatedMeta }> {
  const response = await request.get('/admin/careers/jobs', { params })
  const root = response.data as Record<string, unknown>
  const rows = Array.isArray(root.data) ? (root.data as CareerJob[]) : []
  return { jobs: rows, meta: asMeta(root.meta) }
}

export async function fetchAdminCareerJob(id: number): Promise<CareerJob> {
  const response = await request.get(`/admin/careers/jobs/show/${id}`)
  return response.data.data as CareerJob
}

export async function createAdminCareerJob(
  payload: CareerJobPayload,
): Promise<CareerJob> {
  const response = await request.post('/admin/careers/jobs/store', payload)
  return response.data.data as CareerJob
}

export async function updateAdminCareerJob(
  id: number,
  payload: CareerJobPayload,
): Promise<CareerJob> {
  const response = await request.put(`/admin/careers/jobs/update/${id}`, payload)
  return response.data.data as CareerJob
}

export async function deleteAdminCareerJob(id: number): Promise<void> {
  await request.delete(`/admin/careers/jobs/delete/${id}`)
}

export async function restoreAdminCareerJob(id: number): Promise<CareerJob> {
  const response = await request.post(`/admin/careers/jobs/restore/${id}`)
  return response.data.data as CareerJob
}

export async function forceDeleteAdminCareerJob(id: number): Promise<void> {
  await request.delete(`/admin/careers/jobs/force-delete/${id}`)
}

export async function fetchAdminCareerApplications(params?: {
  status?: string
  search?: string
  career_job_id?: number
  page?: number
  per_page?: number
}): Promise<{ applications: CareerApplication[]; meta: PaginatedMeta }> {
  const response = await request.get('/admin/careers/applications', { params })
  const root = response.data as Record<string, unknown>
  const rows = Array.isArray(root.data) ? (root.data as CareerApplication[]) : []
  return { applications: rows, meta: asMeta(root.meta) }
}

export async function fetchAdminCareerApplication(
  id: number,
): Promise<CareerApplication> {
  const response = await request.get(`/admin/careers/applications/show/${id}`)
  return response.data.data as CareerApplication
}

export async function updateAdminCareerApplicationStatus(
  id: number,
  status: string,
): Promise<CareerApplication> {
  const response = await request.put(`/admin/careers/applications/${id}/status`, {
    status,
  })
  return response.data.data as CareerApplication
}

export async function deleteAdminCareerApplication(id: number): Promise<void> {
  await request.delete(`/admin/careers/applications/${id}`)
}

export async function bulkAdminCareerApplicationAction(
  action: 'mark_reviewed' | 'shortlist' | 'reject' | 'archive' | 'delete',
  ids: number[],
): Promise<void> {
  await request.post('/admin/careers/applications/bulk', { action, ids })
}

export async function exportAdminCareerApplications(params?: {
  status?: string
  search?: string
  career_job_id?: number
}): Promise<Blob> {
  const response = await api.get('/admin/careers/applications/export', {
    params,
    responseType: 'blob',
  })
  return response.data as Blob
}

export async function downloadAdminCareerApplicationResume(
  id: number,
): Promise<Blob> {
  const response = await api.get(`/admin/careers/applications/${id}/resume`, {
    responseType: 'blob',
  })
  return response.data as Blob
}
