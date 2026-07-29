import { request } from '@/api/request'
import type { PrivacyPolicyContent } from '@/services/admin/privacyPolicy'

export type { PrivacyPolicyContent }

export async function fetchPublicPrivacyPolicy(): Promise<PrivacyPolicyContent> {
  const response = await request.get('/privacy-policy')
  return response.data.data as PrivacyPolicyContent
}
