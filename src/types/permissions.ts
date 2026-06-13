/**
 * Spatie permission names from the API (`guard_name: api`).
 * Always use PERMISSIONS constants — never raw strings.
 *
 *   ✅ can(PERMISSIONS.USERS.LIST)
 *   ❌ can('users.list')
 */
export const PERMISSION_GUARD = 'api' as const

export const PERMISSIONS = {
  CATEGORIES: {
    LIST: 'categories.list',
    CREATE: 'categories.create',
    SHOW: 'categories.show',
    UPDATE: 'categories.update',
    DELETE: 'categories.delete',
    RESTORE: 'categories.restore',
    FORCE_DELETE: 'categories.force-delete',
  },
  ROLES: {
    LIST: 'roles.list',
    CREATE: 'roles.create',
    SHOW: 'roles.show',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
    RESTORE: 'roles.restore',
    FORCE_DELETE: 'roles.force-delete',
  },
  ARTICLES: {
    LIST: 'articles.list',
    TRASHED: 'articles.trashed',
    CREATE: 'articles.create',
    SHOW: 'articles.show',
    UPDATE: 'articles.update',
    DELETE: 'articles.delete',
    RESTORE: 'articles.restore',
    FORCE_DELETE: 'articles.force-delete',
    ACTIVITIES: 'articles.activities',
    STATS: 'articles.stats',
    /** User-panel read history (Spatie group: Articles). */
    USER_READ_HISTORY: 'user.read-history',
  },
  TAGS: {
    LIST: 'tags.list',
    CREATE: 'tags.create',
    SHOW: 'tags.show',
    UPDATE: 'tags.update',
    DELETE: 'tags.delete',
    RESTORE: 'tags.restore',
    FORCE_DELETE: 'tags.force-delete',
  },
  SAVE_ARTICLES: {
    LIST: 'save-articles.list',
    TOGGLE: 'save-articles.toggle',
  },
  SITE_SETTINGS: {
    LIST: 'site-settings.list',
    UPDATE: 'site-settings.update',
  },
  PLANS: {
    LIST: 'plans.list',
    TRASHED: 'plans.trashed',
    CREATE: 'plans.create',
    SHOW: 'plans.show',
    UPDATE: 'plans.update',
    DELETE: 'plans.delete',
    RESTORE: 'plans.restore',
    FORCE_DELETE: 'plans.force-delete',
  },
  NOTIFICATION_PREFERENCES: {
    SHOW: 'notification-preferences.show',
    UPDATE: 'notification-preferences.update',
  },
  PERMISSIONS: {
    LIST: 'permissions.list',
  },
  MEDIA: {
    LIST: 'media.list',
    CREATE: 'media.create',
    SHOW: 'media.show',
    DELETE: 'media.delete',
    BULK_DELETE: 'media.bulk-delete',
    SIGNED_PARAMS: 'media.signed-params',
    TRANSFORM: 'media.transform',
  },
  USERS: {
    LIST: 'users.list',
    CREATE: 'users.create',
    PROFILE: 'users.profile',
    PROFILE_UPDATE: 'users.profile-update',
    SHOW: 'users.show',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    ARTICLE_ACTIVITIES: 'users.article-activities',
    TWO_FACTOR_ENABLE: 'users.two-factor-enable',
    READING_ANALYTICS: 'users.reading-analytics',
  },
} as const

type LeafPermissionValues<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? { [K in keyof T]: LeafPermissionValues<T[K]> }[keyof T]
    : never

export type PermissionKey = LeafPermissionValues<typeof PERMISSIONS>

/** Spatie `group_name` keyed by permission `name`. */
export const PERMISSION_GROUP_BY_KEY: Record<PermissionKey, string> = {
  [PERMISSIONS.CATEGORIES.LIST]: 'Categories',
  [PERMISSIONS.CATEGORIES.CREATE]: 'Categories',
  [PERMISSIONS.CATEGORIES.SHOW]: 'Categories',
  [PERMISSIONS.CATEGORIES.UPDATE]: 'Categories',
  [PERMISSIONS.CATEGORIES.DELETE]: 'Categories',
  [PERMISSIONS.CATEGORIES.RESTORE]: 'Categories',
  [PERMISSIONS.CATEGORIES.FORCE_DELETE]: 'Categories',
  [PERMISSIONS.ROLES.LIST]: 'Roles',
  [PERMISSIONS.ROLES.CREATE]: 'Roles',
  [PERMISSIONS.ROLES.SHOW]: 'Roles',
  [PERMISSIONS.ROLES.UPDATE]: 'Roles',
  [PERMISSIONS.ROLES.DELETE]: 'Roles',
  [PERMISSIONS.ROLES.RESTORE]: 'Roles',
  [PERMISSIONS.ROLES.FORCE_DELETE]: 'Roles',
  [PERMISSIONS.ARTICLES.LIST]: 'Articles',
  [PERMISSIONS.ARTICLES.TRASHED]: 'Articles',
  [PERMISSIONS.ARTICLES.CREATE]: 'Articles',
  [PERMISSIONS.ARTICLES.SHOW]: 'Articles',
  [PERMISSIONS.ARTICLES.UPDATE]: 'Articles',
  [PERMISSIONS.ARTICLES.DELETE]: 'Articles',
  [PERMISSIONS.ARTICLES.RESTORE]: 'Articles',
  [PERMISSIONS.ARTICLES.FORCE_DELETE]: 'Articles',
  [PERMISSIONS.ARTICLES.ACTIVITIES]: 'Articles',
  [PERMISSIONS.ARTICLES.STATS]: 'Articles',
  [PERMISSIONS.ARTICLES.USER_READ_HISTORY]: 'Articles',
  [PERMISSIONS.TAGS.LIST]: 'Tags',
  [PERMISSIONS.TAGS.CREATE]: 'Tags',
  [PERMISSIONS.TAGS.SHOW]: 'Tags',
  [PERMISSIONS.TAGS.UPDATE]: 'Tags',
  [PERMISSIONS.TAGS.DELETE]: 'Tags',
  [PERMISSIONS.TAGS.RESTORE]: 'Tags',
  [PERMISSIONS.TAGS.FORCE_DELETE]: 'Tags',
  [PERMISSIONS.SAVE_ARTICLES.LIST]: 'Save Articles',
  [PERMISSIONS.SAVE_ARTICLES.TOGGLE]: 'Save Articles',
  [PERMISSIONS.SITE_SETTINGS.LIST]: 'Site Settings',
  [PERMISSIONS.SITE_SETTINGS.UPDATE]: 'Site Settings',
  [PERMISSIONS.PLANS.LIST]: 'Membership Plans',
  [PERMISSIONS.PLANS.TRASHED]: 'Membership Plans',
  [PERMISSIONS.PLANS.CREATE]: 'Membership Plans',
  [PERMISSIONS.PLANS.SHOW]: 'Membership Plans',
  [PERMISSIONS.PLANS.UPDATE]: 'Membership Plans',
  [PERMISSIONS.PLANS.DELETE]: 'Membership Plans',
  [PERMISSIONS.PLANS.RESTORE]: 'Membership Plans',
  [PERMISSIONS.PLANS.FORCE_DELETE]: 'Membership Plans',
  [PERMISSIONS.NOTIFICATION_PREFERENCES.SHOW]: 'Notification Preferences',
  [PERMISSIONS.NOTIFICATION_PREFERENCES.UPDATE]: 'Notification Preferences',
  [PERMISSIONS.PERMISSIONS.LIST]: 'Permissions',
  [PERMISSIONS.MEDIA.LIST]: 'Media',
  [PERMISSIONS.MEDIA.CREATE]: 'Media',
  [PERMISSIONS.MEDIA.SHOW]: 'Media',
  [PERMISSIONS.MEDIA.DELETE]: 'Media',
  [PERMISSIONS.MEDIA.BULK_DELETE]: 'Media',
  [PERMISSIONS.MEDIA.SIGNED_PARAMS]: 'Media',
  [PERMISSIONS.MEDIA.TRANSFORM]: 'Media',
  [PERMISSIONS.USERS.LIST]: 'Users',
  [PERMISSIONS.USERS.CREATE]: 'Users',
  [PERMISSIONS.USERS.PROFILE]: 'Users',
  [PERMISSIONS.USERS.PROFILE_UPDATE]: 'Users',
  [PERMISSIONS.USERS.SHOW]: 'Users',
  [PERMISSIONS.USERS.UPDATE]: 'Users',
  [PERMISSIONS.USERS.DELETE]: 'Users',
  [PERMISSIONS.USERS.ARTICLE_ACTIVITIES]: 'Users',
  [PERMISSIONS.USERS.TWO_FACTOR_ENABLE]: 'Users',
  [PERMISSIONS.USERS.READING_ANALYTICS]: 'Users',
}

/** All permission names in API order. */
export const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_GROUP_BY_KEY) as PermissionKey[]

/**
 * Permissions used only on the user panel (not admin sidebar / AdminLayout gates).
 */
export const USER_PANEL_PERMISSION_KEYS: PermissionKey[] = [
  PERMISSIONS.SAVE_ARTICLES.LIST,
  PERMISSIONS.SAVE_ARTICLES.TOGGLE,
  PERMISSIONS.NOTIFICATION_PREFERENCES.SHOW,
  PERMISSIONS.NOTIFICATION_PREFERENCES.UPDATE,
  PERMISSIONS.ARTICLES.USER_READ_HISTORY,
  PERMISSIONS.USERS.PROFILE,
  PERMISSIONS.USERS.PROFILE_UPDATE,
  PERMISSIONS.USERS.TWO_FACTOR_ENABLE,
  PERMISSIONS.USERS.READING_ANALYTICS,
]
