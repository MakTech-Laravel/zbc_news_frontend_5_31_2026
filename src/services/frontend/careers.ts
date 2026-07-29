import { request } from '@/api/request'
import type { CareerJob, CareersPageContent } from '@/services/admin/careers'

export async function fetchPublicCareersPage(): Promise<CareersPageContent> {
  const response = await request.get('/careers/page')
  return response.data.data as CareersPageContent
}

export async function fetchPublicCareerJobs(params?: {
  q?: string
  department?: string
  type?: string
}): Promise<CareerJob[]> {
  const response = await request.get('/careers/jobs', { params })
  const rows = response.data.data
  return Array.isArray(rows) ? (rows as CareerJob[]) : []
}

export async function submitCareerApplication(payload: {
  career_job_id: number
  name: string
  email: string
  phone?: string
  cover_letter?: string
  resume: File
}): Promise<void> {
  const form = new FormData()
  form.append('career_job_id', String(payload.career_job_id))
  form.append('name', payload.name)
  form.append('email', payload.email)
  if (payload.phone) form.append('phone', payload.phone)
  if (payload.cover_letter) form.append('cover_letter', payload.cover_letter)
  form.append('resume', payload.resume)

  await request.post('/careers/applications', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
