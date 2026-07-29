import { request } from '@/api/request'

export type AboutUsValue = {
  icon: string
  title: string
  description: string
}

export type AboutUsLeader = {
  name: string
  role: string
  bio: string
  initials: string
  photo?: string | null
}

export type AboutUsJourneyItem = {
  year: string
  short_year: string
  description: string
}

export type AboutUsContent = {
  id?: number
  hero_title: string
  hero_subtitle: string
  intro_html: string
  values: AboutUsValue[]
  leadership_subtitle: string
  leaders: AboutUsLeader[]
  journey: AboutUsJourneyItem[]
  updated_at?: string | null
}

export async function fetchAdminAboutUs(): Promise<AboutUsContent> {
  const response = await request.get('/admin/about-us')
  return response.data.data as AboutUsContent
}

export async function updateAdminAboutUs(
  payload: Omit<AboutUsContent, 'id' | 'updated_at'>,
): Promise<AboutUsContent> {
  const response = await request.put('/admin/about-us', payload)
  return response.data.data as AboutUsContent
}
