import { request } from '@/api/request'

export type PrivacyPolicyContent = {
  id?: number
  hero_meta: string
  plain_summary: string
  overview: string
  data_we_collect: string
  how_we_use: string
  your_rights: string
  data_security: string
  third_parties: string
  contact: string
  updated_at?: string | null
}

export async function fetchAdminPrivacyPolicy(): Promise<PrivacyPolicyContent> {
  const response = await request.get('/admin/privacy-policy')
  return response.data.data as PrivacyPolicyContent
}

export async function updateAdminPrivacyPolicy(
  payload: Omit<PrivacyPolicyContent, 'id' | 'updated_at'>,
): Promise<PrivacyPolicyContent> {
  const response = await request.put('/admin/privacy-policy', payload)
  return response.data.data as PrivacyPolicyContent
}
