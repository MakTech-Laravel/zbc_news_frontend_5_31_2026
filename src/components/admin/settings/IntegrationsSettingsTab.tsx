import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type IntegrationsSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function IntegrationsSettingsTab({ settings }: IntegrationsSettingsTabProps) {
  const { form, setField } = settings;

  return (
    <AdminPanel className="space-y-6">
      <AdminFormField label="Google Analytics" htmlFor="google-analytics">
        <input
          id="google-analytics"
          type="text"
          value={form.googleAnalyticsId}
          onChange={(e) => setField("googleAnalyticsId", e.target.value)}
          placeholder="Tracking ID"
          className={settingsInputClassName}
        />
      </AdminFormField>

      <AdminFormField label="Facebook Pixel" htmlFor="facebook-pixel">
        <input
          id="facebook-pixel"
          type="text"
          value={form.facebookPixelId}
          onChange={(e) => setField("facebookPixelId", e.target.value)}
          placeholder="Pixel ID"
          className={settingsInputClassName}
        />
      </AdminFormField>

      {/* <AdminFormField label="Mailchimp API Key" htmlFor="mailchimp-api">
        <input
          id="mailchimp-api"
          type="password"
          value={form.mailchimpApiKey}
          onChange={(e) => setField("mailchimpApiKey", e.target.value)}
          placeholder="API Key"
          className={settingsInputClassName}
          autoComplete="off"
        />
      </AdminFormField> */}

      {/* <AdminFormField label="Disqus Shortname" htmlFor="disqus-shortname">
        <input
          id="disqus-shortname"
          type="text"
          value={form.disqusShortname}
          onChange={(e) => setField("disqusShortname", e.target.value)}
          placeholder="Shortname"
          className={settingsInputClassName}
        />
      </AdminFormField> */}

      {/* <AdminFormField
        label="Slack Webhook URL"
        htmlFor="slack-webhook"
        hint="Get notifications for new articles and comments"
      >
        <input
          id="slack-webhook"
          type="url"
          value={form.slackWebhookUrl}
          onChange={(e) => setField("slackWebhookUrl", e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className={settingsInputClassName}
        />
      </AdminFormField> */}
    </AdminPanel>
  );
}
