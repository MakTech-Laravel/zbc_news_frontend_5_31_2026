import { request } from '@/api/request'

export type CookieCategoryId = 'essential' | 'analytics' | 'preferences' | 'advertising'

export type CookieCategoryContent = {
  id: CookieCategoryId
  title: string
  description: string
  always_on: boolean
  default_enabled: boolean
}

export type CookieBrowserControl = {
  browser: string
  path: string
}

export type CookieFaqItem = {
  question: string
  answer: string
}

export type CookiePolicyContent = {
  id?: number
  hero_meta: string
  hero_description: string
  preferences_intro: string
  categories: CookieCategoryContent[]
  browser_intro: string
  browser_controls: CookieBrowserControl[]
  faqs: CookieFaqItem[]
  contact_heading: string
  contact_description: string
  contact_email: string
  banner_title: string
  banner_description: string
  updated_at?: string | null
}

export async function fetchAdminCookiePolicy(): Promise<CookiePolicyContent> {
  const response = await request.get('/admin/cookie-policy')
  return response.data.data as CookiePolicyContent
}

export async function updateAdminCookiePolicy(
  payload: Omit<CookiePolicyContent, 'id' | 'updated_at'>,
): Promise<CookiePolicyContent> {
  const response = await request.put('/admin/cookie-policy', payload)
  return response.data.data as CookiePolicyContent
}
