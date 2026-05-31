import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { SettingsCheckbox } from "@/components/admin/settings/SettingsCheckbox";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import {
  CATEGORY_OPTIONS,
  POST_FORMAT_OPTIONS,
} from "@/components/admin/settings/types";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type WritingSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function WritingSettingsTab({ settings }: WritingSettingsTabProps) {
  const { form, setField } = settings;

  return (
    <AdminPanel className="space-y-6">
      <AdminFormField label="Default Category" htmlFor="default-category">
        <AdminFormSelect
          id="default-category"
          value={form.defaultCategory}
          onChange={(v) => setField("defaultCategory", v)}
          options={CATEGORY_OPTIONS}
        />
      </AdminFormField>

      <AdminFormField label="Default Post Format" htmlFor="default-post-format">
        <AdminFormSelect
          id="default-post-format"
          value={form.defaultPostFormat}
          onChange={(v) => setField("defaultPostFormat", v)}
          options={POST_FORMAT_OPTIONS}
        />
      </AdminFormField>

      <div className="flex flex-col gap-3">
        <SettingsCheckbox
          id="enable-auto-save"
          label="Enable auto-save for drafts"
          checked={form.enableAutoSave}
          onCheckedChange={(v) => setField("enableAutoSave", v)}
        />
        <SettingsCheckbox
          id="require-featured-image"
          label="Require featured image for articles"
          checked={form.requireFeaturedImage}
          onCheckedChange={(v) => setField("requireFeaturedImage", v)}
        />
        <SettingsCheckbox
          id="enable-ai-writing"
          label="Enable AI writing assistance"
          checked={form.enableAiWriting}
          onCheckedChange={(v) => setField("enableAiWriting", v)}
        />
      </div>
    </AdminPanel>
  );
}
