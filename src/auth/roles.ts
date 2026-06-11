import { isSpatieSuperAdmin } from '@/auth/adminSpatie'
import { type AuthUser } from '@/auth/types'
import { ROLES } from '@/types/roles'

export type Role = string

function normalizeRoleToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/_/g, '-')
}

/** Primary Spatie role on the session (`user.role` or first `roles[]` entry). */
export function getPrimaryRouteRole(user: AuthUser | null): string | null {
  if (!user) return null
  if (typeof user.role === 'string' && user.role.trim()) {
    return normalizeRoleToken(user.role)
  }
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return normalizeRoleToken(String(user.roles[0]))
  }
  return null
}

/**
 * Reader panel (`UserLayout`).
 * Default Spatie role is `user`; missing role also treated as user.
 */
export function isUserPanelUser(user: AuthUser | null): boolean {
  if (!user) return false
  const primary = getPrimaryRouteRole(user)
  return primary === ROLES.USER || primary === null
}

/**
 * Admin panel (`AdminLayout`) — any Spatie role except `user`.
 * Includes `super-admin`, `editor`, etc.
 */
export function isAdminPanelUser(user: AuthUser | null): boolean {
  if (!user) return false
  return !isUserPanelUser(user)
}

/** @deprecated Prefer getPrimaryRouteRole or getUserRoleNames from usePermission. */
export function getUserRoles(user: AuthUser | null): Role[] {
  if (!user) return []
  const primary = getPrimaryRouteRole(user)
  const merged = [
    ...(primary ? [primary] : []),
    ...(user.roles ?? []).map((r) => normalizeRoleToken(String(r))),
    ...(user.adminSpatieRoles ?? []).map((r) => normalizeRoleToken(String(r))),
  ]
  return Array.from(new Set(merged.filter(Boolean)))
}

/**
 * Route guard helper.
 * `admin` / `user` map to panel access, not only literal Spatie role strings.
 */
export function hasAnyRole(user: AuthUser | null, required: Role | Role[]) {
  const requiredList = Array.isArray(required) ? required : [required]

  if (requiredList.includes('admin') && isAdminPanelUser(user)) return true
  if (requiredList.includes('user') && isUserPanelUser(user)) return true
  if (requiredList.includes('admin') && isSpatieSuperAdmin(user)) return true

  const roles = getUserRoles(user)
  return requiredList.some((r) => roles.includes(normalizeRoleToken(r)))
}
