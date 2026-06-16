import { useEffect, useState } from "react";

import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { SettingsCheckbox } from "@/components/admin/settings/SettingsCheckbox";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { POST_FORMAT_OPTIONS } from "@/components/admin/settings/types";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { request } from "@/api/request";

type WritingSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

type CategoryOption = { value: string; label: string };

export function WritingSettingsTab({ settings }: WritingSettingsTabProps) {
  const { form, setField } = settings;
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    request
      .get("/categories")
      .then((response) => {
        const categories = response.data?.data ?? [];
        if (!Array.isArray(categories)) return;

        setCategoryOptions(
          categories
            .filter((cat: { status?: string }) => cat.status === "active")
            .map((cat: { id: number; title?: string; name?: string }) => ({
              value: String(cat.id),
              label: cat.title ?? cat.name ?? `Category ${cat.id}`,
            })),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <AdminPanel className="space-y-6">
      <AdminFormField label="Default Category" htmlFor="default-category">
        <AdminFormSelect
          id="default-category"
          value={form.defaultCategory}
          onChange={(v) => setField("defaultCategory", v)}
          options={
            categoryOptions.length > 0
              ? categoryOptions
              : [{ value: "", label: "No categories available" }]
          }
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
      </div>
    </AdminPanel>
  );
}
