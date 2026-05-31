import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import {
  settingsInputClassName,
  settingsTextareaClassName,
} from "@/components/admin/settings/settingsFormStyles";
import type { SeoPage } from "@/data/admin/mockSeoPages";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type SeoPageEditFormProps = {
  page: SeoPage;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string) => void;
};

export function SeoPageEditForm({
  page,
  metaTitle,
  metaDescription,
  metaKeywords,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onMetaKeywordsChange,
}: SeoPageEditFormProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="text-xl font-medium text-admin-heading">SEO: {page.name}</h2>
        <p className="mt-1 text-base text-[#2b2a2a]">Page URL: {page.url}</p>
        <p className="mt-1 text-sm uppercase tracking-wide text-[#2b2a2a]">
          Admin dashboard &gt; SEO &gt; {page.name}
        </p>
      </div>

      <AdminPanel className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-admin-heading">Meta tags</h3>
          <p className="mt-1 text-base text-admin-heading">
            Fill what you need. Leave empty to use the site defaults.
          </p>
        </div>

        <AdminFormField label="Meta title" htmlFor="meta-title">
          <input
            id="meta-title"
            type="text"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Fill what you need. Leave empty to use the site defaults."
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Meta description" htmlFor="meta-description">
          <textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="e.g. Create a legally compliant will online in minutes. Expert checks included."
            className={settingsTextareaClassName}
            rows={4}
          />
        </AdminFormField>

        <AdminFormField label="Meta keywords" htmlFor="meta-keywords">
          <textarea
            id="meta-keywords"
            value={metaKeywords}
            onChange={(e) => onMetaKeywordsChange(e.target.value)}
            placeholder="e.g. will writing, online will, lasting power of attorney, probate"
            className={settingsTextareaClassName}
            rows={4}
          />
        </AdminFormField>
      </AdminPanel>
    </div>
  );
}
