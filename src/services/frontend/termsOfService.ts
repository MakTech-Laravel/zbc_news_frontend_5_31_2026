import { request } from '@/api/request'
import type { TermsOfServiceContent } from '@/services/admin/termsOfService'

export type { TermsOfServiceContent }

export async function fetchPublicTermsOfService(): Promise<TermsOfServiceContent> {
  const response = await request.get('/terms-of-service')
  return response.data.data as TermsOfServiceContent
}
