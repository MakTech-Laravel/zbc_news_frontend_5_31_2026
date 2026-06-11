import * as React from 'react'

import { isSpatieSuperAdmin } from '@/auth/adminSpatie'
import type { AuthUser } from '@/auth/types'
import { useAuth } from '@/auth/useAuth'
import { PERMISSIONS, type PermissionKey } from '@/types/permissions'
import { ROLES } from '@/types/roles'

export { PERMISSIONS, ROLES }
export type { PermissionKey }

const PERMISSIONS_STORAGE_KEY = 'permissions'

function normalizeRoleToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/_/g, '-')
}

/** Flat permission list from auth user (login response / profile), with storage fallback. */
export function getUserPermissions(user: AuthUser | null): PermissionKey[] {
  if (user?.permissions?.length) {
    return user.permissions as PermissionKey[]
  }

  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? (parsed.filter((p): p is PermissionKey => typeof p === 'string') as PermissionKey[])
      : []
  } catch {
    return []
  }
}

/** Flat role names from auth user (`roles[]`, `role`, Spatie admin roles). */
export function getUserRoleNames(user: AuthUser | null): string[] {
  if (!user) return []

  const merged = [
    ...(user.roles ?? []),
    ...(user.adminSpatieRoles ?? []),
    ...(user.role ? [user.role] : []),
  ]

  return Array.from(new Set(merged.map((r) => normalizeRoleToken(String(r))).filter(Boolean)))
}

export function isSuperAdminUser(user: AuthUser | null): boolean {
  if (!user) return false
  if (user.is_super_admin === true) return true
  return isSpatieSuperAdmin(user)
}

/**
 * usePermission
 *
 * Reads from `auth.user.roles` and `auth.user.permissions` (via useAuth).
 * Super-admin bypasses all permission checks.
 */
export function usePermission() {
  const { user, isUserLoading } = useAuth()

  const isSuperAdmin = isSuperAdminUser(user)
  const userPermissions = React.useMemo(() => getUserPermissions(user), [user])
  const userRoles = React.useMemo(() => getUserRoleNames(user), [user])

  const can = React.useCallback(
    (permission: PermissionKey): boolean =>
      isSuperAdmin || userPermissions.includes(permission),
    [isSuperAdmin, userPermissions],
  )

  const canAny = React.useCallback(
    (permissions: PermissionKey[]): boolean =>
      isSuperAdmin || permissions.some((p) => userPermissions.includes(p)),
    [isSuperAdmin, userPermissions],
  )

  const canAll = React.useCallback(
    (permissions: PermissionKey[]): boolean =>
      isSuperAdmin || permissions.every((p) => userPermissions.includes(p)),
    [isSuperAdmin, userPermissions],
  )

  const hasRole = React.useCallback(
    (role: string): boolean => userRoles.includes(normalizeRoleToken(role)),
    [userRoles],
  )

  const hasAnyRole = React.useCallback(
    (roles: string[]): boolean =>
      roles.some((r) => userRoles.includes(normalizeRoleToken(r))),
    [userRoles],
  )

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isUserLoading,
    userPermissions,
    userRoles,
    user,
  }
}
