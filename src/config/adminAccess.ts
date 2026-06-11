import { ADMIN_NAV_ITEMS, type AdminNavItemConfig } from '@/config/adminNav'
import { PERMISSIONS, type PermissionKey } from '@/types/permissions'

export type AdminSectionPermission = PermissionKey | null

/** Built from nav config — do not duplicate permission maps elsewhere. */
export const ADMIN_SECTION_PERMISSIONS: Record<string, AdminSectionPermission> =
  Object.fromEntries(ADMIN_NAV_ITEMS.map((item) => [item.segment, item.permission]))

export const ADMIN_NAV_PERMISSIONS: Record<string, AdminSectionPermission> =
  Object.fromEntries(ADMIN_NAV_ITEMS.map((item) => [item.path, item.permission]))

/** Nested admin routes that need a more specific permission than the parent segment. */
const ADMIN_PATH_PERMISSION_OVERRIDES: { test: RegExp; permission: PermissionKey }[] = [
  { test: /^\/admin\/articles\/trash/, permission: PERMISSIONS.ARTICLES.TRASHED },
  { test: /^\/admin\/articles\/create/, permission: PERMISSIONS.ARTICLES.CREATE },
  { test: /^\/admin\/articles\/[^/]+\/activities/, permission: PERMISSIONS.ARTICLES.ACTIVITIES },
  { test: /^\/admin\/articles\/edit\//, permission: PERMISSIONS.ARTICLES.UPDATE },
  { test: /^\/admin\/rabc\/create/, permission: PERMISSIONS.ROLES.CREATE },
  { test: /^\/admin\/rabc\/edit\//, permission: PERMISSIONS.ROLES.UPDATE },
  { test: /^\/admin\/users\/[^/]+\/article-activities/, permission: PERMISSIONS.USERS.ARTICLE_ACTIVITIES },
  { test: /^\/admin\/settings\/seo\//, permission: PERMISSIONS.SITE_SETTINGS.UPDATE },
]

/** Resolve permission for any admin URL (nested routes inherit or override). */
export function getRequiredPermissionForAdminPath(pathname: string): AdminSectionPermission {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (!normalized.startsWith('/admin')) return null

  const override = ADMIN_PATH_PERMISSION_OVERRIDES.find(({ test }) => test.test(normalized))
  if (override) return override.permission

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
