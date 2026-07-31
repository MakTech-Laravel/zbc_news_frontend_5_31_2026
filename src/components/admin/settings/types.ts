export const SETTINGS_TABS = [
  { id: "general", label: "General" },
  { id: "seo", label: "SEO" },
  { id: "writing", label: "Writing" },
  { id: "reading", label: "Reading" },
  { id: "integrations", label: "Integrations" },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

export type AdminSettingsForm = {
  siteName: string;
  tagline: string;
  headerLayout: "compact" | "stacked";
  timezone: string;
  language: string;
  defaultCategory: string;
  defaultPostFormat: string;
  enableAutoSave: boolean;
  requireFeaturedImage: boolean;
  enableAiWriting: boolean;
  postsPerPage: string;
  allowComments: boolean;
  requireRegistrationToComment: boolean;
  autoApproveKnownUsers: boolean;
  relatedArticlesCount: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleAdsenseClient: string;
  googleAdsenseBannerSlot: string;
  googleAdsenseSidebarSlot: string;
  googleAdsenseSquareSlot: string;
  mailchimpApiKey: string;
  newsletterProvider: string;
  newsletterFromEmail: string;
  newsletterFromName: string;
  resendApiKey: string;
  brevoApiKey: string;
  brevoListId: string;
  newsletterWebhookSecret: string;
  mailchimpListId: string;
  disqusShortname: string;
  slackWebhookUrl: string;
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsForm = {
  siteName: "ZBC News",
  tagline: "Breaking news and analysis from around the world",
  headerLayout: "stacked",
  timezone: "America/New_York",
  language: "en",
  defaultCategory: "",
  defaultPostFormat: "Standard",
  enableAutoSave: true,
  requireFeaturedImage: false,
  enableAiWriting: false,
  postsPerPage: "10",
  allowComments: true,
  requireRegistrationToComment: true,
  autoApproveKnownUsers: false,
  relatedArticlesCount: "3",
  googleAnalyticsId: "",
  facebookPixelId: "",
  googleAdsenseClient: "",
  googleAdsenseBannerSlot: "",
  googleAdsenseSidebarSlot: "",
  googleAdsenseSquareSlot: "",
  mailchimpApiKey: "",
  newsletterProvider: "smtp",
  newsletterFromEmail: "",
  newsletterFromName: "",
  resendApiKey: "",
  brevoApiKey: "",
  brevoListId: "",
  newsletterWebhookSecret: "",
  mailchimpListId: "",
  disqusShortname: "",
  slackWebhookUrl: "",
};

export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "UTC", label: "UTC" },
] as const;

export const HEADER_LAYOUT_OPTIONS = [
  {
    value: "compact",
    label: "Compact — logo, search, menu, and account on one row",
  },
  {
    value: "stacked",
    label: "Stacked — wide search with menu directly underneath",
  },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ar", label: "Arabic" },
] as const;

export const CATEGORY_OPTIONS = [] as const;

export const POST_FORMAT_OPTIONS = [
  { value: "Standard", label: "Standard" },
  { value: "Video", label: "Video" },
  { value: "Gallery", label: "Gallery" },
  { value: "Longform", label: "Longform" },
] as const;
