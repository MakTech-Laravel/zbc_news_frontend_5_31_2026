import { MediaImageField } from "@/components/admin/media/MediaImageField";
import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { TIMEZONE_OPTIONS } from "@/components/admin/settings/types";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type GeneralSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function GeneralSettingsTab({ settings }: GeneralSettingsTabProps) {
  const { form, setField, logoUrl, setLogoUrl } = settings;

  return (
    <AdminPanel className="space-y-6">
      <AdminFormField label="Site Name" htmlFor="site-name">
        <input
          id="site-name"
          type="text"
          value={form.siteName}
          onChange={(e) => setField("siteName", e.target.value)}
          className={settingsInputClassName}
        />
      </AdminFormField>

      <AdminFormField label="Tagline" htmlFor="site-tagline">
        <input
          id="site-tagline"
          type="text"
          value={form.tagline}
          onChange={(e) => setField("tagline", e.target.value)}
          className={settingsInputClassName}
        />
      </AdminFormField>

      <AdminFormField label="Site Logo">
        <MediaImageField
          value={logoUrl}
          onChange={setLogoUrl}
          uploadLabel="Select site logo"
          previewAlt="Site logo preview"
          urlPlaceholder="Or paste logo URL"
        />
      </AdminFormField>

      <AdminFormField label="Timezone" htmlFor="site-timezone">
        <AdminFormSelect
          id="site-timezone"
          value={form.timezone}
          onChange={(v) => setField("timezone", v)}
          options={TIMEZONE_OPTIONS}
        />
      </AdminFormField>
    </AdminPanel>
  );
}
