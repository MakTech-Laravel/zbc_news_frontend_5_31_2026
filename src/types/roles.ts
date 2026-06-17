/**
 * Reader-panel Spatie role slugs.
 */
export const READER_ROLES = ['user', 'subscriber'] as const

export const ROLES = {
  USER: 'user',
  SUBSCRIBER: 'subscriber',
  SUPER_ADMIN: 'super-admin',
} as const

export type KnownRole = (typeof ROLES)[keyof typeof ROLES]
