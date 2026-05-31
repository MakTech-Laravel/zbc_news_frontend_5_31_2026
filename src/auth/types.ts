export type AuthUser = {
  id: string | number
  name?: string
  email?: string
  /** Profile image URL from API (avatar, avatar_url, or profile_image). */
  avatar?: string | null
  role?: string
  roles?: string[]
  /**
   * Spatie `admin` guard permission names (from AdminResource / admin login).
   * Used with `can()` in the admin area. Do not mix with app route role strings.
   */
  permissions?: string[]
  /** Spatie role names assigned to this admin (e.g. super-admin, editor-unit). */
  adminSpatieRoles?: string[]
  /** From AdminResource — true when this account has the Spatie `super-admin` role. */
  is_super_admin?: boolean
}

