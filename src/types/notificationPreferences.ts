export type NotificationPreferenceKey =
  | 'breaking_news'
  | 'daily_newsletter'
  | 'personalized_recommendations'
  | 'comment_replies'
  | 'saved_article_updates'
  | 'platform_announcements'

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>

export const NOTIFICATION_PREFERENCE_OPTIONS: {
  id: NotificationPreferenceKey
  label: string
}[] = [
  { id: 'breaking_news', label: 'Breaking News Alerts' },
  { id: 'daily_newsletter', label: 'Daily Newsletter' },
  { id: 'personalized_recommendations', label: 'Personalized Recommendations' },
  { id: 'comment_replies', label: 'Comment Replies' },
  { id: 'saved_article_updates', label: 'Saved Article Updates' },
  { id: 'platform_announcements', label: 'Platform Announcements' },
]

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  breaking_news: true,
  daily_newsletter: true,
  personalized_recommendations: true,
  comment_replies: false,
  saved_article_updates: false,
  platform_announcements: true,
}
