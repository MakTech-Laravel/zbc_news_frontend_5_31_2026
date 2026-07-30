import { PERMISSIONS, type PermissionKey } from '@/types/permissions'

/**
 * Admin sidebar + URL permission config (single source of truth).
 *
 * Rules (admin panel only — never apply to UserSidebar / user dashboard):
 * - `super_admin` sees every item (bypass in usePermission / AdminSidebar)
 * - Everyone else only sees items whose `permission` they have
 * - `permission: null` = shared landing item for any admin-panel user (Dashboard)
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
    label: 'Menus',
    path: '/admin/menus',
    segment: 'menus',
    permission: PERMISSIONS.MENUS.LIST,
  },
  {
    label: 'Articles',
    path: '/admin/articles',
    segment: 'articles',
    permission: PERMISSIONS.ARTICLES.LIST,
  },
  {
    label: 'Breaking News',
    path: '/admin/breaking-news',
    segment: 'breaking-news',
    permission: PERMISSIONS.ARTICLES.LIST,
  },
  {
    label: 'Live Updates',
    path: '/admin/live-updates',
    segment: 'live-updates',
    permission: PERMISSIONS.ARTICLES.LIST,
  },
  {
    label: 'Sub Menu',
    path: '/admin/sub-menu',
    segment: 'sub-menu',
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
    permission: PERMISSIONS.SITE_SETTINGS.LIST,
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
    label: 'Contact Messages',
    path: '/admin/contact-messages',
    segment: 'contact-messages',
    permission: PERMISSIONS.CONTACT_INQUIRIES.LIST,
  },
  {
    label: 'Careers',
    path: '/admin/careers',
    segment: 'careers',
    permission: PERMISSIONS.CAREER_JOBS.LIST,
  },
  {
    label: 'Privacy Policy',
    path: '/admin/privacy-policy',
    segment: 'privacy-policy',
    permission: PERMISSIONS.PRIVACY_POLICY.SHOW,
  },
  {
    label: 'Terms of Service',
    path: '/admin/terms-of-service',
    segment: 'terms-of-service',
    permission: PERMISSIONS.TERMS_OF_SERVICE.SHOW,
  },
  {
    label: 'About Us',
    path: '/admin/about-us',
    segment: 'about-us',
    permission: PERMISSIONS.ABOUT_US.SHOW,
  },
  {
    label: 'Cookie Policy',
    path: '/admin/cookie-policy',
    segment: 'cookie-policy',
    permission: PERMISSIONS.COOKIE_POLICY.SHOW,
  },
  {
    label: 'Accessibility Statement',
    path: '/admin/accessibility-statement',
    segment: 'accessibility-statement',
    permission: PERMISSIONS.ACCESSIBILITY_STATEMENT.SHOW,
  },
  {
    label: 'Report',
    path: '/admin/accessibility-reports',
    segment: 'accessibility-reports',
    permission: PERMISSIONS.ACCESSIBILITY_REPORTS.LIST,
  },
  {
    label: 'My Profile',
    path: '/admin/profile',
    segment: 'profile',
    permission: PERMISSIONS.USERS.PROFILE,
    end: true,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    segment: 'settings',
    permission: PERMISSIONS.SITE_SETTINGS.LIST,
    end: false,
  },
]

/** Whether an admin sidebar item should render for the current staff user. */
export function isAdminNavItemVisible(
  item: AdminNavItemConfig,
  options: {
    isSuperAdmin: boolean
    can: (permission: PermissionKey) => boolean
  },
): boolean {
  if (options.isSuperAdmin) return true
  if (!item.permission) return true
  return options.can(item.permission)
}
