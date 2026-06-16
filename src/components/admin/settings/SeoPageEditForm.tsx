import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import {
  settingsInputClassName,
  settingsTextareaClassName,
} from "@/components/admin/settings/settingsFormStyles";
import type { SeoPage } from "@/types/siteSettings";
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
      </div>

      <AdminPanel className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-admin-heading">Meta tags</h3>
          <p className="mt-1 text-base text-admin-heading">
            Fill what you need. Empty fields fall back to the site name and tagline.
          </p>
        </div>

        <AdminFormField label="Meta title" htmlFor="meta-title">
          <input
            id="meta-title"
            type="text"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="e.g. Technology News — ZBC News"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Meta description" htmlFor="meta-description">
          <textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="e.g. Latest technology news, reviews, and analysis from ZBC News."
            className={settingsTextareaClassName}
            rows={4}
          />
        </AdminFormField>

        <AdminFormField label="Meta keywords" htmlFor="meta-keywords">
          <textarea
            id="meta-keywords"
            value={metaKeywords}
            onChange={(e) => onMetaKeywordsChange(e.target.value)}
            placeholder="e.g. technology, news, gadgets, innovation"
            className={settingsTextareaClassName}
            rows={4}
          />
        </AdminFormField>
      </AdminPanel>
    </div>
  );
}
