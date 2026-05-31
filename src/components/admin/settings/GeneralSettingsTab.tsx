import * as React from "react";

import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import {
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/components/admin/settings/types";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { Button } from "@/components/ui/button";

type GeneralSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function GeneralSettingsTab({ settings }: GeneralSettingsTabProps) {
  const { form, setField, logoPreview, setLogoFile } = settings;
  const fileRef = React.useRef<HTMLInputElement>(null);

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
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded bg-gradient-to-br from-zbc-blue to-[#193cb8] text-2xl font-bold text-white"
            aria-hidden
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt=""
                className="size-full rounded object-cover"
              />
            ) : (
              "Z"
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-10 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90"
          >
            Upload Logo
          </Button>
        </div>
      </AdminFormField>

      <AdminFormField label="Timezone" htmlFor="site-timezone">
        <AdminFormSelect
          id="site-timezone"
          value={form.timezone}
          onChange={(v) => setField("timezone", v)}
          options={TIMEZONE_OPTIONS}
        />
      </AdminFormField>

      <AdminFormField label="Language" htmlFor="site-language">
        <AdminFormSelect
          id="site-language"
          value={form.language}
          onChange={(v) => setField("language", v)}
          options={LANGUAGE_OPTIONS}
        />
      </AdminFormField>
    </AdminPanel>
  );
}
