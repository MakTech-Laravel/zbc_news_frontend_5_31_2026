import {
  extractBearerTokenFromLoginBody,
  extractRefreshTokenFromLoginBody,
  extractUserFromAuthPayload,
} from '@/api/laravelResponse'
import { request } from '@/api/request'
import { type AuthContextValue } from '@/auth/context'
import { getUserRoles, isAdminPanelUser } from '@/auth/roles'
import { setRefreshToken } from '@/auth/token'
import { type AuthUser } from '@/auth/types'
import { env } from '@/config/env'
import {
  type AuthRole,
  type LoginPayload,
  type PasswordResetOtpPayload,
  type RegisterPayload,
  type VerifyOtpPayload,
} from '@/features/auth/types'

type AuthHandlers = Pick<
  AuthContextValue,
  'authStrategy' | 'setToken' | 'setUser' | 'refreshSession' | 'resetAuthState'
>

function pickOtpValue(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const record = data as Record<string, unknown>
  const direct = [record.otp, record.code, record.verification_code].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )
  if (direct) return direct

  const nestedData = record.data
  if (nestedData && typeof nestedData === 'object') {
    const nestedRecord = nestedData as Record<string, unknown>
    const nested = [nestedRecord.otp, nestedRecord.code, nestedRecord.verification_code].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    )
    if (nested) return nested
  }

  return null
}

function logOtpFromResponse(data: unknown, context: string) {
  if (import.meta.env.DEV) {
    console.log(`[auth] ${context} raw response:`, data)
  }
  const otp = pickOtpValue(data)
  if (!otp) return
  console.log(`[auth] ${context} OTP:`, otp)
}

function ensureRoleMatchesExpected(user: unknown, expectedRole: AuthRole) {
  const parsed =
    (user && typeof user === 'object' && 'email' in (user as object)
      ? (user as AuthUser)
      : extractUserFromAuthPayload(user)) ?? null
  if (!parsed) return

  if (isAdminPanelUser(parsed)) return

  const roles = getUserRoles(parsed)
  if (!roles.includes(expectedRole)) {
    throw new Error(
      `This account is not registered as ${expectedRole}. Please choose the correct account type.`,
    )
  }
}

async function hydrateSessionFromLoginBody(
  body: unknown,
  handlers: AuthHandlers,
  missingCookieMessage: string,
  missingTokenMessage: string,
) {
  const loggedInUser = extractUserFromAuthPayload(body)

  if (handlers.authStrategy === 'http_only_cookie') {
    const currentUser = await handlers.refreshSession()
    if (!currentUser) {
      throw new Error(missingCookieMessage)
    }
    return currentUser
  }

  const token = extractBearerTokenFromLoginBody(body)
  if (!token) {
    throw new Error(missingTokenMessage)
  }

  handlers.setToken(token)

  const refresh = extractRefreshTokenFromLoginBody(body)
  if (refresh) {
    setRefreshToken(refresh)
  }

  if (loggedInUser) {
    handlers.setUser(loggedInUser)
    // Login already returned user + roles; skip profile probe when backend has no GET /auth/profile.
    return loggedInUser
  }

  const refreshedUser = await handlers.refreshSession()
  return refreshedUser
}

export async function loginUserWithRole(payload: LoginPayload, handlers: AuthHandlers) {
  try {
    const res = await request.post<unknown>('/auth/login', payload)
    
    const user = await hydrateSessionFromLoginBody(
      res.data,
      handlers,
      'Unable to restore your session after login.',
      'Login response is missing access token.',
    )
    ensureRoleMatchesExpected(user, payload.role)
    localStorage.setItem(
      "permissions",
      JSON.stringify(user?.permissions)
    );
    return user
  } catch (error) {
    handlers.resetAuthState()
    throw error
  }
}

export async function registerUser(payload: RegisterPayload) {
  const res = await request.post<unknown>('/auth/register', payload)
  logOtpFromResponse(res.data, 'register')
  return res.data
}

export async function registerAndLoginUser(
  payload: RegisterPayload,
  handlers: AuthHandlers,
) {
  // Kept for compatibility; registration now requires email OTP before login.
  await registerUser(payload)
  handlers.resetAuthState()
  throw new Error('Please verify your email before signing in.')
}

export async function requestPasswordResetOtp(payload: PasswordResetOtpPayload) {
  const res = await request.post<unknown>('/auth/forgot-password', payload)
  logOtpFromResponse(res.data, 'password reset')
}

export type ResetPasswordPayload = {
  email: string
  otp: string
  password: string
  password_confirmation: string
}

export async function resetPassword(payload: ResetPasswordPayload) {
  await request.post<unknown>('/auth/reset-password', payload)
}

export async function resendRegistrationOtp(payload: PasswordResetOtpPayload) {
  const res = await request.post<unknown>('/auth/otp/resend', payload)
  logOtpFromResponse(res.data, 'register resend')
}

export async function verifyRegistrationOtp(
  payload: VerifyOtpPayload,
  handlers: AuthHandlers,
  selectedRole: AuthRole,
) {
  const verifyPayload = {
    ...payload,
    code: payload.otp,
    verification_code: payload.otp,
  }
  const res = await request.post<unknown>('/auth/otp/verify', verifyPayload)
  logOtpFromResponse(res.data, 'verify-otp')

  const user = await hydrateSessionFromLoginBody(
    res.data,
    handlers,
    'OTP verified, but we could not restore your session.',
    'OTP verified, but the response is missing an access token.',
  )
  ensureRoleMatchesExpected(user, selectedRole)
  return user
}

export async function logoutAllDevices() {
  await request.post(env.authLogoutAllPath)
}

export function resolveDashboardPath(user: unknown) {
  const authUser =
    user && typeof user === 'object' && ('role' in user || 'roles' in user)
      ? (user as AuthUser)
      : extractUserFromAuthPayload(user)

  if (!authUser) return '/user/dashboard'

  if (isAdminPanelUser(authUser)) return '/admin/dashboard'
  return '/user/dashboard'
}
