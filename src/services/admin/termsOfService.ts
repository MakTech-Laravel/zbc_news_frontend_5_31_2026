import { request } from '@/api/request'

export type TermsOfServiceContent = {
  id?: number
  hero_meta: string
  quick_summary: string
  account_terms: string
  content_ip: string
  subscriptions: string
  prohibited: string
  disputes: string
  contact: string
  updated_at?: string | null
}

export async function fetchAdminTermsOfService(): Promise<TermsOfServiceContent> {
  const response = await request.get('/admin/terms-of-service')
  return response.data.data as TermsOfServiceContent
}

export async function updateAdminTermsOfService(
  payload: Omit<TermsOfServiceContent, 'id' | 'updated_at'>,
): Promise<TermsOfServiceContent> {
  const response = await request.put('/admin/terms-of-service', payload)
  return response.data.data as TermsOfServiceContent
}
