import { request } from '@/api/request'
import type { AccessibilityStatementContent } from '@/services/admin/accessibilityStatement'

export type { AccessibilityStatementContent }

export async function fetchPublicAccessibilityStatement(): Promise<AccessibilityStatementContent> {
  const response = await request.get('/accessibility-statement')
  return response.data.data as AccessibilityStatementContent
}
