import { api } from '@/api/client'
import { extractUserFromAuthPayload } from '@/api/laravelResponse'
import { env } from '@/config/env'
import { type AuthUser } from '@/auth/types'

/** GET current user — optional profile probe after reload (skipped on login when user is in login JSON). */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (env.authMePath === 'none' || env.authMePath === 'false') return null

  const primary = ['/auth/profile', '/admin/me'] as const
  const custom =
    env.authMePath &&
      env.authMePath !== '/me' &&
      !primary.includes(env.authMePath as (typeof primary)[number])
      ? [env.authMePath]
      : []
  const pathCandidates = Array.from(new Set([...primary, ...custom, env.authMePath].filter(Boolean)))

  for (const path of pathCandidates) {
    try {
      const res = await api.get<unknown>(path, {
        skipAuthRedirect: true,
      })
      const user = extractUserFromAuthPayload(res.data)
      if (user) return user
    } catch {
      // try next candidate path
    }
  }
  return null
}
