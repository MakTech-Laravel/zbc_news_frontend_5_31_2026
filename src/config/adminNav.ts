import { PERMISSIONS, type PermissionKey } from '@/types/permissions'

/**
 * Admin sidebar + URL permission config (single source of truth).
 * `permission: null` = visible to every admin-panel user (e.g. dashboard landing).
 */
export type AdminNavItemConfig = {
  label: string
  path: string
  /** First segment after `/admin/` — used for nested route permission inheritance. */
  segment: string
  permission: PermissionKey | null
  end?: boolean
}

export const ADMIN_NAV_ITEMS: AdminNavItemConfig[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    segment: 'dashboard',
    permission: null,
    end: true,
  },
  {
    label: 'Categories',
    path: '/admin/categories',
    segment: 'categories',
    permission: PERMISSIONS.CATEGORIES.LIST,
  },
  {
    label: 'Articles',
    path: '/admin/articles',
    segment: 'articles',
    permission: PERMISSIONS.ARTICLES.LIST,
  },
  {
    label: 'Media',
    path: '/admin/media',
    segment: 'media',
    permission: PERMISSIONS.MEDIA.LIST,
  },
  {
    label: 'RABC',
    path: '/admin/rabc',
    segment: 'rabc',
    permission: PERMISSIONS.ROLES.LIST,
  },
  {
    label: 'Users',
    path: '/admin/users',
    segment: 'users',
    permission: PERMISSIONS.USERS.LIST,
    end: true,
  },
  {
    label: 'Monetization',
    path: '/admin/monetization',
    segment: 'monetization',
    permission: PERMISSIONS.PLANS.LIST,
  },
  {
    label: 'Newsletters',
    path: '/admin/newsletters',
    segment: 'newsletters',
    permission: null,
  },
  {
    label: 'Announcements',
    path: '/admin/announcements',
    segment: 'announcements',
    permission: PERMISSIONS.ANNOUNCEMENTS.LIST,
  },
  {
    label: 'Comments',
    path: '/admin/comments',
    segment: 'comments',
    permission: PERMISSIONS.COMMENTS.LIST,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    segment: 'settings',
    permission: PERMISSIONS.SITE_SETTINGS.LIST,
    end: false,
  },
]
