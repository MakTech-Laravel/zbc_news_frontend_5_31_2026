import { useEffect, useState } from "react";

import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { SettingsCheckbox } from "@/components/admin/settings/SettingsCheckbox";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { POST_FORMAT_OPTIONS } from "@/components/admin/settings/types";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { request } from "@/api/request";
import {
  flattenCategoryTree,
  type CategoryTreeNode,
} from "@/lib/categoryTree";

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
        const categories: CategoryTreeNode[] = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const byId = new Map(
          flattenCategoryTree(categories).map((cat) => [String(cat.id), cat]),
        );

        setCategoryOptions(
          flattenCategoryTree(categories)
            .filter((cat) => cat.status === "active")
            .map((cat) => {
              const parent =
                cat.parent_id != null ? byId.get(String(cat.parent_id)) : null;
              const title = cat.title ?? cat.name ?? `Category ${cat.id}`;
              return {
                value: String(cat.id),
                label: parent
                  ? `${parent.title ?? parent.name} / ${title}`
                  : title,
              };
            }),
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
