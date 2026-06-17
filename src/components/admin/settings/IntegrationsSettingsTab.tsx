import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type IntegrationsSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

const PROVIDER_OPTIONS = [
  { value: "smtp", label: "SMTP (Laravel Mail)" },
  { value: "resend", label: "Resend" },
  { value: "brevo", label: "Brevo (Sendinblue)" },
  { value: "mailchimp", label: "Mailchimp Transactional" },
] as const;

export function IntegrationsSettingsTab({ settings }: IntegrationsSettingsTabProps) {
  const { form, setField } = settings;

  return (
    <AdminPanel className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-admin-heading">Newsletter delivery</h3>
        <p className="mt-1 text-sm text-admin-trend-muted">
          Configure the email provider used for newsletter campaigns and verification emails.
        </p>
      </div>

      <AdminFormField label="Email provider" htmlFor="newsletter-provider">
        <select
          id="newsletter-provider"
          value={form.newsletterProvider}
          onChange={(e) => setField("newsletterProvider", e.target.value)}
          className={settingsInputClassName}
        >
          {PROVIDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </AdminFormField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminFormField label="From email" htmlFor="newsletter-from-email">
          <input
            id="newsletter-from-email"
            type="email"
            value={form.newsletterFromEmail}
            onChange={(e) => setField("newsletterFromEmail", e.target.value)}
            placeholder="news@yourdomain.com"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="From name" htmlFor="newsletter-from-name">
          <input
            id="newsletter-from-name"
            type="text"
            value={form.newsletterFromName}
            onChange={(e) => setField("newsletterFromName", e.target.value)}
            placeholder="ZBC News"
            className={settingsInputClassName}
          />
        </AdminFormField>
      </div>

      <AdminFormField label="Resend API key" htmlFor="resend-api">
        <input
          id="resend-api"
          type="password"
          value={form.resendApiKey}
          onChange={(e) => setField("resendApiKey", e.target.value)}
          placeholder="re_..."
          className={settingsInputClassName}
          autoComplete="off"
        />
      </AdminFormField>

      <AdminFormField label="Brevo API key" htmlFor="brevo-api">
        <input
          id="brevo-api"
          type="password"
          value={form.brevoApiKey}
          onChange={(e) => setField("brevoApiKey", e.target.value)}
          placeholder="xkeysib-..."
          className={settingsInputClassName}
          autoComplete="off"
        />
      </AdminFormField>

      <AdminFormField label="Mailchimp API key" htmlFor="mailchimp-api">
        <input
          id="mailchimp-api"
          type="password"
          value={form.mailchimpApiKey}
          onChange={(e) => setField("mailchimpApiKey", e.target.value)}
          placeholder="API Key"
          className={settingsInputClassName}
          autoComplete="off"
        />
      </AdminFormField>

      <AdminFormField label="Mailchimp audience list ID" htmlFor="mailchimp-list-id">
        <input
          id="mailchimp-list-id"
          type="text"
          value={form.mailchimpListId}
          onChange={(e) => setField("mailchimpListId", e.target.value)}
          placeholder="Optional — for future list sync"
          className={settingsInputClassName}
        />
      </AdminFormField>

      <hr className="border-border" />

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

      <AdminFormField label="Disqus Shortname" htmlFor="disqus-shortname">
        <input
          id="disqus-shortname"
          type="text"
          value={form.disqusShortname}
          onChange={(e) => setField("disqusShortname", e.target.value)}
          placeholder="Shortname"
          className={settingsInputClassName}
        />
      </AdminFormField>
    </AdminPanel>
  );
}
