import { type AuthUser } from '@/auth/types'

function permissionNamesFromRaw(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const x of raw) {
    if (typeof x === 'string' && x) {
      out.push(x)
      continue
    }
    if (x && typeof x === 'object' && 'name' in x && typeof (x as { name: unknown }).name === 'string') {
      const n = (x as { name: string }).name
      if (n) out.push(n)
    }
  }
  return out
}

function normalizeSpatieRoleName(name: string): string {
  return name.trim().toLowerCase().replace(/_/g, '-')
}

/** Single route role from API `roles[0]` or `role`, with a typed fallback. */
function primaryRoleFromRaw(raw: Record<string, unknown>, fallback: string): string {
  const spatieRoles = spatieRoleNamesFromRaw(raw.roles)
  if (spatieRoles.length > 0) {
    return normalizeSpatieRoleName(spatieRoles[0]!)
  }
  if (typeof raw.role === 'string' && raw.role) {
    return normalizeSpatieRoleName(raw.role)
  }
  return fallback
}

/** Map AdminResource / admin login payload into AuthUser preserving the API role name. */
export function normalizeAdminAuthUser(raw: Record<string, unknown>): AuthUser {
  const spatieRoles = spatieRoleNamesFromRaw(raw.roles)
  const perms = permissionNamesFromRaw(raw.permissions)
  const { roles: _dropRoles, permissions: _dropPerms, ...rest } = raw
  const role = primaryRoleFromRaw(raw, 'admin')
  const isSuper =
    raw.is_super_admin === true ||
    raw.is_super_admin === 1 ||
    raw.is_super_admin === '1' ||
    raw.is_super_admin === 'true' ||
    spatieRoles.some((r) => {
      const n = normalizeSpatieRoleName(r)
      return n === 'super-admin' || n === 'superadmin'
    })
  return {
    ...(rest as unknown as AuthUser),
    role,
    roles: [role],
    adminSpatieRoles: spatieRoles,
    permissions: perms,
    is_super_admin: isSuper ? true : raw.is_super_admin === false ? false : undefined,
  }
}

/** Map login/profile user payloads with Spatie role objects into route-friendly AuthUser. */
export function normalizeAuthUser(raw: Record<string, unknown>): AuthUser {
  if (isAdminResourceShape(raw)) return normalizeAdminAuthUser(raw)

  const perms = permissionNamesFromRaw(raw.permissions)
  const routeRole = primaryRoleFromRaw(raw, 'user')
  const { roles: _dropRoles, permissions: _dropPerms, ...rest } = raw

  return {
    ...(rest as unknown as AuthUser),
    role: routeRole,
    roles: [routeRole],
    permissions: perms.length ? perms : undefined,
  }
}

function spatieRoleNamesFromRaw(raw: unknown): string[] {
  return permissionNamesFromRaw(raw)
}

function rolesLookLikeSpatieAdmin(raw: unknown): boolean {
  return spatieRoleNamesFromRaw(raw).some((name) => {
    const n = normalizeSpatieRoleName(name)
    return (
      n === 'admin' ||
      n === 'super-admin' ||
      n === 'superadmin' ||
      n.endsWith('-admin')
    )
  })
}

function isAdminResourceShape(o: Record<string, unknown>): boolean {
  if (typeof o.email !== 'string') return false

  const routeRole =
    typeof o.role === 'string' ? normalizeSpatieRoleName(o.role) : ''
  if (routeRole === 'user') return false

  const spatieNames = spatieRoleNamesFromRaw(o.roles).map(normalizeSpatieRoleName)
  if (spatieNames.includes('user')) return false

  if (rolesLookLikeSpatieAdmin(o.roles)) return true
  if (o.is_super_admin === true || o.is_super_admin === 1 || o.is_super_admin === '1') return true
  if (Array.isArray(o.permissions) && o.permissions.length > 0) return true
  return false
}

/**
 * Typical Laravel `sendResponse($success, $message, $payload)` JSON:
 * `{ success?: boolean, message?: string, data?: T }`
 */
export function unwrapLaravelData<T = unknown>(body: unknown): T | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const o = body as Record<string, unknown>
  if ('data' in o && o.data !== undefined) {
    return o.data as T
  }
  return body as T
}

function unwrapLaravelDataDeep(body: unknown): unknown {
  let cur: unknown = body
  for (let i = 0; i < 4; i++) {
    if (!cur || typeof cur !== 'object') return cur
    const o = cur as Record<string, unknown>
    if (!('data' in o)) return cur
    cur = o.data
  }
  return cur
}

/** Passport / your login payload: `token` or `access_token` at root or under `data`. */
export function extractBearerTokenFromLoginBody(body: unknown): string | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const direct =
    (typeof root.token === 'string' && root.token) ||
    (typeof root.access_token === 'string' && root.access_token) ||
    null
  if (direct) return direct
  const inner = root.data
  if (inner && typeof inner === 'object') {
    const d = inner as Record<string, unknown>
    return (
      (typeof d.token === 'string' && d.token) ||
      (typeof d.access_token === 'string' && d.access_token) ||
      null
    )
  }
  return null
}

/** OAuth / Passport: `refresh_token` at root or under `data`. */
export function extractRefreshTokenFromLoginBody(body: unknown): string | null {
  if (body === null || body === undefined) return null
  if (typeof body !== 'object') return null
  const root = body as Record<string, unknown>
  const direct =
    (typeof root.refresh_token === 'string' && root.refresh_token) || null
  if (direct) return direct
  const inner = root.data
  if (inner && typeof inner === 'object') {
    const d = inner as Record<string, unknown>
    return (typeof d.refresh_token === 'string' && d.refresh_token) || null
  }
  return null
}

/** Map Laravel `UserResource` / user object from login or `/me`. */
export function extractUserFromAuthPayload(body: unknown): AuthUser | null {
  const data = unwrapLaravelDataDeep(body)
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>

  // Common: { data: { user: {...} } }
  if ('user' in o && o.user && typeof o.user === 'object') {
    const u = o.user as Record<string, unknown>
    if ('id' in u || 'email' in u) {
      return normalizeAuthUser(u)
    }
  }

  // Admin login often returns: { data: { admin: {...} } }
  if ('admin' in o && o.admin && typeof o.admin === 'object') {
    const a = o.admin as Record<string, unknown>
    if ('id' in a || 'email' in a) return normalizeAdminAuthUser(a)
  }

  // Sometimes: { data: {...user fields...} }
  if ('id' in o || 'email' in o) {
    return normalizeAuthUser(o)
  }
  return null
}
