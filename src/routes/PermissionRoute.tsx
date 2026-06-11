import { Navigate, useLocation } from 'react-router-dom'

import { usePermission } from '@/hooks/usePermission'
import type { PermissionKey } from '@/types/permissions'

type PermissionRouteProps = {
  /** Single permission required to view this route. */
  permission?: PermissionKey | null
  /** Multiple permissions — use with `requireAll`. */
  permissions?: PermissionKey[]
  /** When true, user must have ALL listed permissions. Default: any one. */
  requireAll?: boolean
  children: React.ReactNode
}

/**
 * Gate a route by Spatie permission (like Inertia middleware + can()).
 * Redirects to `/unauthorized` when access is denied.
 */
export function PermissionRoute({
  permission,
  permissions,
  requireAll = false,
  children,
}: PermissionRouteProps) {
  const location = useLocation()
  const { can, canAny, canAll, isUserLoading } = usePermission()

  if (isUserLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading&hellip;
      </div>
    )
  }

  const allowed = (() => {
    if (permissions?.length) {
      return requireAll ? canAll(permissions) : canAny(permissions)
    }
    if (permission) return can(permission)
    return true
  })()

  if (!allowed) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />
  }

  return <>{children}</>
}
