export type SiteSettingsApi = {
  id?: number;
  site_name: string | null;
  site_tag: string | null;
  site_logo: string | null;
  timezone: string | null;
  language: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  default_category_id: number | null;
  default_post_format: string | null;
  enable_auto_save: boolean;
  require_featured_image: boolean;
  enable_ai_writing: boolean;
  posts_per_page: number;
  allow_comments: boolean;
  authenticate_comment_only: boolean;
  auto_approve_known_users: boolean;
  related_article: number;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  mailchimp_api_key: string | null;
  disqus_shortname: string | null;
  slack_webhook_url: string | null;
  enable_comments: boolean;
};

export type PublicSiteSettings = {
  siteName: string;
  siteTag: string;
  siteLogo: string | null;
  timezone: string;
  language: string;
  defaultCategoryId: number | null;
  defaultPostFormat: string;
  enableAutoSave: boolean;
  requireFeaturedImage: boolean;
  postsPerPage: number;
  allowComments: boolean;
  requireRegistrationToComment: boolean;
  autoApproveKnownUsers: boolean;
  relatedArticlesCount: number;
  googleAnalyticsId: string;
  facebookPixelId: string;
  disqusShortname: string;
};

export type SeoPageApi = {
  id: number;
  page_key: string;
  name: string;
  url_path: string;
  is_template: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
};

export type SeoPage = {
  id: string;
  pageKey: string;
  name: string;
  url: string;
  isTemplate: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

export function mapSeoPageFromApi(raw: SeoPageApi): SeoPage {
  return {
    id: raw.page_key,
    pageKey: raw.page_key,
    name: raw.name,
    url: raw.url_path,
    isTemplate: raw.is_template,
    metaTitle: raw.meta_title ?? "",
    metaDescription: raw.meta_description ?? "",
    metaKeywords: raw.meta_keywords ?? "",
  };
}

export function mapSiteSettingsToForm(raw: SiteSettingsApi) {
  return {
    siteName: raw.site_name ?? "",
    tagline: raw.site_tag ?? "",
    timezone: raw.timezone ?? "America/New_York",
    language: raw.language ?? "en",
    defaultCategory: raw.default_category_id ? String(raw.default_category_id) : "",
    defaultPostFormat: raw.default_post_format ?? "Standard",
    enableAutoSave: raw.enable_auto_save ?? true,
    requireFeaturedImage: raw.require_featured_image ?? false,
    enableAiWriting: raw.enable_ai_writing ?? false,
    postsPerPage: String(raw.posts_per_page ?? 10),
    allowComments: raw.allow_comments ?? true,
    requireRegistrationToComment: raw.authenticate_comment_only ?? true,
    autoApproveKnownUsers: raw.auto_approve_known_users ?? false,
    relatedArticlesCount: String(raw.related_article ?? 3),
    googleAnalyticsId: raw.google_analytics_id ?? "",
    facebookPixelId: raw.facebook_pixel_id ?? "",
    mailchimpApiKey: raw.mailchimp_api_key ?? "",
    disqusShortname: raw.disqus_shortname ?? "",
    slackWebhookUrl: raw.slack_webhook_url ?? "",
  };
}

export function mapPublicSiteSettings(raw: SiteSettingsApi): PublicSiteSettings {
  return {
    siteName: raw.site_name ?? "ZBC News",
    siteTag: raw.site_tag ?? "",
    siteLogo: raw.site_logo,
    timezone: raw.timezone ?? "America/New_York",
    language: raw.language ?? "en",
    defaultCategoryId: raw.default_category_id,
    defaultPostFormat: raw.default_post_format ?? "Standard",
    enableAutoSave: raw.enable_auto_save ?? true,
    requireFeaturedImage: raw.require_featured_image ?? false,
    postsPerPage: raw.posts_per_page ?? 10,
    allowComments: Boolean(raw.allow_comments && raw.enable_comments),
    requireRegistrationToComment: raw.authenticate_comment_only ?? true,
    autoApproveKnownUsers: raw.auto_approve_known_users ?? false,
    relatedArticlesCount: raw.related_article ?? 3,
    googleAnalyticsId: raw.google_analytics_id ?? "",
    facebookPixelId: raw.facebook_pixel_id ?? "",
    disqusShortname: raw.disqus_shortname ?? "",
  };
}
