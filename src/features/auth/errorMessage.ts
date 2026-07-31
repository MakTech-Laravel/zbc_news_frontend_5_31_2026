import axios from 'axios'

type LaravelErrorBody = {
  message?: string
  errors?: Record<string, string[]>
}

export type FieldErrorMap = Record<string, string>

export function getAuthFieldErrors(error: unknown): FieldErrorMap {
  if (!axios.isAxiosError(error)) return {}
  const data = error.response?.data as LaravelErrorBody | undefined
  const out: FieldErrorMap = {}
  if (data?.errors) {
    for (const [field, messages] of Object.entries(data.errors)) {
      const first = messages?.find(Boolean)
      if (first) out[field] = first
    }
  }

  // Keep credential failures generic — do not hint which field was wrong.
  const msg = data?.message?.toLowerCase() ?? ''
  const isGenericCredentialError =
    msg.includes('invalid credentials') ||
    msg.includes('invalid login') ||
    msg.includes('wrong credentials') ||
    msg.includes('incorrect credentials')

  if (isGenericCredentialError) {
    if (!out.email) out.email = 'Invalid email or password'
    if (!out.password) out.password = 'Invalid email or password'
  }

  return out
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as LaravelErrorBody | undefined
    if (data?.message) return data.message

    const firstValidationError = data?.errors
      ? Object.values(data.errors).flat().find(Boolean)
      : null
    if (firstValidationError) return firstValidationError
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
