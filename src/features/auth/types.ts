export type AuthRole = 'user'

export type LoginPayload = {
  email: string
  password: string
  role: AuthRole
  captcha_token?: string
}

export type RegisterPayload = {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  role: AuthRole
  accepted_terms: boolean
  captcha_token?: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export type PasswordResetOtpPayload = {
  email: string
  captcha_token?: string
}
