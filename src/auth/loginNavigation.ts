import type { Location, NavigateFunction } from 'react-router-dom'

export function isUnsafeLoginReturnPath(pathname: string | undefined): boolean {
  if (!pathname) return true
  return (
    pathname === '/unauthorized' ||
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/otp-verification')
  )
}

export function resolveLoginReturnPath(
  location?: Pick<Location, 'pathname' | 'search'>,
): string {
  if (location) return location.pathname + location.search
  if (typeof window === 'undefined') return '/'
  return window.location.pathname + window.location.search
}

export function buildLoginHref(returnPath: string): string {
  if (isUnsafeLoginReturnPath(returnPath)) {
    return '/login'
  }
  return `/login?next=${encodeURIComponent(returnPath)}`
}

export function navigateToLogin(
  navigate: NavigateFunction,
  location: Pick<Location, 'pathname' | 'search'>,
  options?: { replace?: boolean },
): void {
  navigate(buildLoginHref(resolveLoginReturnPath(location)), {
    replace: options?.replace ?? true,
    state: { from: location },
  })
}

export function resolvePostLoginPath(
  location: Pick<Location, 'state'>,
  nextFromQuery?: string | null,
): string | null {
  const fromState = (
    location.state as { from?: { pathname?: string; search?: string } } | null
  )?.from

  const fromPath = fromState
    ? `${fromState.pathname ?? ''}${fromState.search ?? ''}`
    : nextFromQuery?.trim() || null

  if (!fromPath || isUnsafeLoginReturnPath(fromPath)) {
    return null
  }

  return fromPath
}
