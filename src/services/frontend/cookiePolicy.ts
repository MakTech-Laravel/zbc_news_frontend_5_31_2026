import { request } from '@/api/request'
import type { CookiePolicyContent } from '@/services/admin/cookiePolicy'

export type { CookiePolicyContent }

export async function fetchPublicCookiePolicy(): Promise<CookiePolicyContent> {
  const response = await request.get('/cookie-policy')
  return response.data.data as CookiePolicyContent
}
