import { ADMIN_NAV_ITEMS, type AdminNavItemConfig } from '@/config/adminNav'
import type { PermissionKey } from '@/types/permissions'

export type AdminSectionPermission = PermissionKey | null

/** Built from nav config — do not duplicate permission maps elsewhere. */
export const ADMIN_SECTION_PERMISSIONS: Record<string, AdminSectionPermission> =
  Object.fromEntries(ADMIN_NAV_ITEMS.map((item) => [item.segment, item.permission]))

export const ADMIN_NAV_PERMISSIONS: Record<string, AdminSectionPermission> =
  Object.fromEntries(ADMIN_NAV_ITEMS.map((item) => [item.path, item.permission]))

/** Resolve permission for any admin URL (nested routes inherit parent section). */
export function getRequiredPermissionForAdminPath(pathname: string): AdminSectionPermission {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (!normalized.startsWith('/admin')) return null

  const rest = normalized.slice('/admin'.length).replace(/^\//, '')
  const segment = rest.split('/')[0] || 'dashboard'

  if (segment in ADMIN_SECTION_PERMISSIONS) {
    return ADMIN_SECTION_PERMISSIONS[segment] ?? null
  }

  return null
}

export function getNavItemPermission(navPath: string): AdminSectionPermission {
  return ADMIN_NAV_PERMISSIONS[navPath] ?? null
}

export function getAdminNavItemByPath(navPath: string): AdminNavItemConfig | undefined {
  return ADMIN_NAV_ITEMS.find((item) => item.path === navPath)
}
