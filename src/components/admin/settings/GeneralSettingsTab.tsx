import * as React from "react";

import { MediaImageField } from "@/components/admin/media/MediaImageField";
import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { HEADER_LAYOUT_OPTIONS } from "@/components/admin/settings/types";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { getTimezoneOptions } from "@/lib/timezones";

type GeneralSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function GeneralSettingsTab({ settings }: GeneralSettingsTabProps) {
  const { form, setField, logoUrl, setLogoUrl, faviconUrl, setFaviconUrl } = settings;
  const timezoneOptions = React.useMemo(
    () => getTimezoneOptions(form.timezone),
    [form.timezone],
  );

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
          variant="logo"
          uploadLabel="Select site logo"
          previewAlt="Site logo preview"
          urlPlaceholder="Or paste logo URL"
        />
      </AdminFormField>

      <AdminFormField label="Favicon">
        <MediaImageField
          value={faviconUrl}
          onChange={setFaviconUrl}
          variant="logo"
          uploadLabel="Select favicon"
          previewAlt="Favicon preview"
          urlPlaceholder="Or paste favicon URL"
        />
        <p className="mt-2 text-xs text-admin-trend-muted">
          Shown in browser tabs. Prefer a square PNG or SVG (32×32 or larger).
        </p>
      </AdminFormField>

      <AdminFormField label="Header Layout" htmlFor="header-layout">
        <AdminFormSelect
          id="header-layout"
          value={form.headerLayout}
          onChange={(v) =>
            setField("headerLayout", v === "compact" ? "compact" : "stacked")
          }
          options={[...HEADER_LAYOUT_OPTIONS]}
        />
        <p className="mt-2 text-xs text-admin-trend-muted">
          Controls the public site header: compact keeps menu on one row; stacked
          places the menu under the search bar.
        </p>
      </AdminFormField>

      <AdminFormField label="Timezone" htmlFor="site-timezone">
        <AdminFormSelect
          id="site-timezone"
          value={form.timezone}
          onChange={(v) => setField("timezone", v)}
          options={timezoneOptions}
        />
        <p className="mt-2 text-xs text-admin-trend-muted">
          Used for article timestamps, scheduling, and newsletter send times across the site.
        </p>
      </AdminFormField>
    </AdminPanel>
  );
}
