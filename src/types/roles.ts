/**
 * Spatie role names used for panel routing.
 * Roles are dynamic on the backend — these are the known route/panel roles.
 */
export const ROLES = {
  USER: 'user',
  SUPER_ADMIN: 'super-admin',
} as const

export type KnownRole = (typeof ROLES)[keyof typeof ROLES]
