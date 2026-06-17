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
  mailchimpApiKey: string;
  newsletterProvider: string;
  newsletterFromEmail: string;
  newsletterFromName: string;
  resendApiKey: string;
  brevoApiKey: string;
  mailchimpListId: string;
  disqusShortname: string;
  slackWebhookUrl: string;
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsForm = {
  siteName: "ZBC News",
  tagline: "Breaking news and analysis from around the world",
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
  mailchimpApiKey: "",
  newsletterProvider: "smtp",
  newsletterFromEmail: "",
  newsletterFromName: "",
  resendApiKey: "",
  brevoApiKey: "",
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
