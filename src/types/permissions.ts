/**
 * Spatie permission names — always use these constants, never raw strings.
 *
 *   ✅ can(PERMISSIONS.USER.LIST)
 *   ❌ can('user.list')
 */
export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: 'view dashboard',
  },
  USER: {
    LIST: 'user.list',
    CREATE: 'user.create',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
  },
  MONETIZATION: {
    LIST: 'monetization.list',
    UPDATE: 'monetization.update',
  },
  CATEGORY: {
    LIST: 'category.list',
    CREATE: 'category.create',
    UPDATE: 'category.update',
    DELETE: 'category.delete',
  },
  ARTICLE: {
    LIST: 'article.list',
    CREATE: 'article.create',
    UPDATE: 'article.update',
    DELETE: 'article.delete',
  },
  ROLE: {
    LIST: 'role.list',
    CREATE: 'role.create',
    UPDATE: 'role.update',
    DELETE: 'role.delete',
  },
  SETTINGS: {
    LIST: 'settings.list',
    UPDATE: 'settings.update',
  },
} as const

type LeafPermissionValues<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? { [K in keyof T]: LeafPermissionValues<T[K]> }[keyof T]
    : never

export type PermissionKey = LeafPermissionValues<typeof PERMISSIONS>
