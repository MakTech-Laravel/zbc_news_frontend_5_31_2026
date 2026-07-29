import { request } from '@/api/request'
import type { AboutUsContent } from '@/services/admin/aboutUs'

export type { AboutUsContent }

export async function fetchPublicAboutUs(): Promise<AboutUsContent> {
  const response = await request.get('/about-us')
  return response.data.data as AboutUsContent
}
