import { request } from "@/api/request";
import {
  mapSiteSettingsToForm,
  type SiteSettingsApi,
} from "@/types/siteSettings";
import type { AdminSettingsForm } from "@/components/admin/settings/types";

function extractPayload<T>(body: unknown): T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid API response");
  }
  const root = body as Record<string, unknown>;
  return (root.data ?? root) as T;
}

export async function fetchAdminSiteSettings(): Promise<{
  settings: AdminSettingsForm;
  logoUrl: string | null;
  raw: SiteSettingsApi;
}> {
  const response = await request.get("/admin/site-settings");
  const raw = extractPayload<SiteSettingsApi>(response.data);

  return {
    settings: mapSiteSettingsToForm(raw),
    logoUrl: raw.site_logo,
    raw,
  };
}

export async function updateAdminSiteSettings(
  form: AdminSettingsForm,
  logoFile?: File | null,
): Promise<SiteSettingsApi> {
  const formData = new FormData();

  formData.append("site_name", form.siteName);
  formData.append("site_tag", form.tagline);
  formData.append("timezone", form.timezone);
  formData.append("language", form.language);

  if (form.defaultCategory) {
    formData.append("default_category_id", form.defaultCategory);
  }

  formData.append("default_post_format", form.defaultPostFormat);
  formData.append("enable_auto_save", form.enableAutoSave ? "1" : "0");
  formData.append("require_featured_image", form.requireFeaturedImage ? "1" : "0");
  formData.append("enable_ai_writing", form.enableAiWriting ? "1" : "0");
  formData.append("posts_per_page", form.postsPerPage);
  formData.append("allow_comments", form.allowComments ? "1" : "0");
  formData.append("enable_comments", form.allowComments ? "1" : "0");
  formData.append(
    "authenticate_comment_only",
    form.requireRegistrationToComment ? "1" : "0",
  );
  formData.append("auto_approve_known_users", form.autoApproveKnownUsers ? "1" : "0");
  formData.append("related_article", form.relatedArticlesCount);
  formData.append("google_analytics_id", form.googleAnalyticsId);
  formData.append("facebook_pixel_id", form.facebookPixelId);
  formData.append("mailchimp_api_key", form.mailchimpApiKey);
  formData.append("newsletter_provider", form.newsletterProvider);
  formData.append("newsletter_from_email", form.newsletterFromEmail);
  formData.append("newsletter_from_name", form.newsletterFromName);
  formData.append("resend_api_key", form.resendApiKey);
  formData.append("brevo_api_key", form.brevoApiKey);
  formData.append("mailchimp_list_id", form.mailchimpListId);
  formData.append("disqus_shortname", form.disqusShortname);
  formData.append("slack_webhook_url", form.slackWebhookUrl);

  if (logoFile) {
    formData.append("site_logo", logoFile);
  }

  const response = await request.post("/admin/site-settings/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return extractPayload<SiteSettingsApi>(response.data);
}
