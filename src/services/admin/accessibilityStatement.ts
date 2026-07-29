import { request } from '@/api/request'

export type AccessibilityBadge = {
  label: string
  variant: 'success' | 'info'
}

export type AccessibilityStat = {
  value: string
  label: string
}

export type AccessibilityFeature = {
  title: string
  icon: string
  items: string[]
}

export type AccessibilityShortcut = {
  key: string
  action: string
}

export type AccessibilityTechnology = {
  name: string
  platform: string
  status: 'Supported' | 'Partial'
}

export type AccessibilityStatementContent = {
  id?: number
  hero_eyebrow: string
  hero_title: string
  hero_intro: string
  badges: AccessibilityBadge[]
  commitment_heading: string
  commitment_paragraphs: string[]
  commitment_stats: AccessibilityStat[]
  features_heading: string
  features: AccessibilityFeature[]
  shortcuts_heading: string
  keyboard_shortcuts: AccessibilityShortcut[]
  technologies_heading: string
  supported_technologies: AccessibilityTechnology[]
  known_limitations: string
  report_heading: string
  report_intro: string
  contact_email: string
  contact_phone: string
  contact_address: string
  cta_text: string
  cta_button_label: string
  updated_at?: string | null
}

export async function fetchAdminAccessibilityStatement(): Promise<AccessibilityStatementContent> {
  const response = await request.get('/admin/accessibility-statement')
  return response.data.data as AccessibilityStatementContent
}

export async function updateAdminAccessibilityStatement(
  payload: Omit<AccessibilityStatementContent, 'id' | 'updated_at'>,
): Promise<AccessibilityStatementContent> {
  const response = await request.put('/admin/accessibility-statement', payload)
  return response.data.data as AccessibilityStatementContent
}
