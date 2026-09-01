import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type ContactSocialSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function ContactSocialSettingsTab({ settings }: ContactSocialSettingsTabProps) {
  const { form, setField } = settings;

  return (
    <div className="space-y-6">
      <AdminPanel className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-admin-heading">Follow Us — social links</h3>
          <p className="mt-1 text-sm text-admin-trend-muted">
            Shown in the site footer and on the public Contact page. Leave a field empty to hide
            that network.
          </p>
        </div>

        <AdminFormField label="Facebook URL" htmlFor="social-facebook-url">
          <input
            id="social-facebook-url"
            type="url"
            value={form.socialFacebookUrl}
            onChange={(e) => setField("socialFacebookUrl", e.target.value)}
            placeholder="https://facebook.com/your-page"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="X (Twitter) URL" htmlFor="social-x-url">
          <input
            id="social-x-url"
            type="url"
            value={form.socialXUrl}
            onChange={(e) => setField("socialXUrl", e.target.value)}
            placeholder="https://x.com/your-handle"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="LinkedIn URL" htmlFor="social-linkedin-url">
          <input
            id="social-linkedin-url"
            type="url"
            value={form.socialLinkedinUrl}
            onChange={(e) => setField("socialLinkedinUrl", e.target.value)}
            placeholder="https://www.linkedin.com/company/your-company"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="TikTok URL" htmlFor="social-tiktok-url">
          <input
            id="social-tiktok-url"
            type="url"
            value={form.socialTiktokUrl}
            onChange={(e) => setField("socialTiktokUrl", e.target.value)}
            placeholder="https://www.tiktok.com/@your-handle"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Instagram URL" htmlFor="social-instagram-url">
          <input
            id="social-instagram-url"
            type="url"
            value={form.socialInstagramUrl}
            onChange={(e) => setField("socialInstagramUrl", e.target.value)}
            placeholder="https://www.instagram.com/your-handle"
            className={settingsInputClassName}
          />
        </AdminFormField>
      </AdminPanel>

      <AdminPanel className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-admin-heading">Direct Contact emails</h3>
          <p className="mt-1 text-sm text-admin-trend-muted">
            Public contact addresses shown on the Contact page. These are separate from admin
            notification routing in the Notifications tab.
          </p>
        </div>

        <AdminFormField label="General Inquiries" htmlFor="contact-general-email">
          <input
            id="contact-general-email"
            type="email"
            value={form.contactGeneralEmail}
            onChange={(e) => setField("contactGeneralEmail", e.target.value)}
            placeholder="info@example.com"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Press / Media" htmlFor="contact-press-email">
          <input
            id="contact-press-email"
            type="email"
            value={form.contactPressEmail}
            onChange={(e) => setField("contactPressEmail", e.target.value)}
            placeholder="newsroom@example.com"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Advertising" htmlFor="contact-advertising-email">
          <input
            id="contact-advertising-email"
            type="email"
            value={form.contactAdvertisingEmail}
            onChange={(e) => setField("contactAdvertisingEmail", e.target.value)}
            placeholder="ads@example.com"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Corrections" htmlFor="contact-corrections-email">
          <input
            id="contact-corrections-email"
            type="email"
            value={form.contactCorrectionsEmail}
            onChange={(e) => setField("contactCorrectionsEmail", e.target.value)}
            placeholder="corrections@example.com"
            className={settingsInputClassName}
          />
        </AdminFormField>
      </AdminPanel>

      <AdminPanel className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-admin-heading">Our Office</h3>
          <p className="mt-1 text-sm text-admin-trend-muted">
            Shown on the public Contact page. Use one line per address row. Leave blank to hide the
            office section.
          </p>
        </div>

        <AdminFormField label="Office address" htmlFor="contact-office-address">
          <textarea
            id="contact-office-address"
            value={form.contactOfficeAddress}
            onChange={(e) => setField("contactOfficeAddress", e.target.value)}
            rows={10}
            placeholder={"425 Fifth Avenue, Suite 1200\nNew York, NY 10016\nUnited States"}
            className={`${settingsInputClassName} h-[200px] resize-y py-2.5`}
          />
        </AdminFormField>

        <AdminFormField label="Google Maps link (optional)" htmlFor="contact-office-maps-url">
          <input
            id="contact-office-maps-url"
            type="url"
            value={form.contactOfficeMapsUrl}
            onChange={(e) => setField("contactOfficeMapsUrl", e.target.value)}
            placeholder="https://maps.google.com/?q=..."
            className={settingsInputClassName}
          />
          <p className="mt-2 text-xs text-admin-trend-muted">
            If empty, a Google Maps search link is generated automatically from the address.
          </p>
        </AdminFormField>
      </AdminPanel>
    </div>
  );
}
