import { Navigate, useLocation } from 'react-router-dom'

import { rolePolicy } from '@/auth/rolePolicy'
import { getUserRoles, hasAnyRole, isAdminPanelUser } from '@/auth/roles'
import { useAuth } from '@/auth/useAuth'
import { env } from '@/config/env'

function pickDashboardForUserRoles(user: ReturnType<typeof useAuth>['user']): string {
  if (isAdminPanelUser(user)) {
    return rolePolicy.admin?.dashboard ?? '/admin/dashboard'
  }
  const roles = getUserRoles(user)
  if (roles.includes('user')) {
    return rolePolicy.user?.dashboard ?? '/user/dashboard'
  }
  for (const r of roles) {
    const dash = rolePolicy[r]?.dashboard
    if (dash) return dash
  }
  return '/user/dashboard'
}

/**
 * GuestGate protects guest-only pages (login/fallback pages).
 *
 * Rules:
 * - If not authenticated: render children.
 * - If authenticated:
 *   - loginMode=single: redirect to user's recommended dashboard.
 *   - loginMode=multi: redirect only if `roleScope` matches user's role(s); otherwise allow viewing the page.
 */
export function GuestGate({
  roleScope,
  redirectTo,
  children,
}: {
  /** If set, only users with these roles get redirected away in multi-login mode. */
  roleScope?: string | string[]
  /** Optional override for where to send authenticated users. */
  redirectTo?: string
  children: React.ReactNode
}) {
  const { isAuthenticated, isSessionLoading, isUserLoading, user } = useAuth()
  const location = useLocation()

  if (isSessionLoading || isUserLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) return children

  const isRegisterOtpPage =
    location.pathname === '/otp-verification' &&
    new URLSearchParams(location.search).get('purpose') === 'register'
  if (isRegisterOtpPage) return children

  const recommended = redirectTo ?? pickDashboardForUserRoles(user)

  if (env.loginMode === 'single') {
    return <Navigate to={recommended} replace />
  }

  // multi login mode: only redirect away if this is the user's own role login page
  if (!roleScope) return children
  if (!hasAnyRole(user, roleScope)) return children
  return <Navigate to={recommended} replace />
}
