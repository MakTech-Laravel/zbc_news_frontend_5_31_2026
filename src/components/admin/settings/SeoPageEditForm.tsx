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
  canonicalUrl: string;
  noindex: boolean;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string) => void;
  onCanonicalUrlChange: (value: string) => void;
  onNoindexChange: (value: boolean) => void;
};

export function SeoPageEditForm({
  page,
  metaTitle,
  metaDescription,
  metaKeywords,
  canonicalUrl,
  noindex,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onMetaKeywordsChange,
  onCanonicalUrlChange,
  onNoindexChange,
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
            placeholder="e.g. Technology News"
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

        <AdminFormField label="Canonical URL" htmlFor="canonical-url">
          <input
            id="canonical-url"
            type="url"
            value={canonicalUrl}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder="Leave blank to use this page's own URL"
            className={settingsInputClassName}
          />
        </AdminFormField>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-base font-medium text-admin-heading">
              Hide from search engines
            </p>
            <p className="mt-1 text-sm text-admin-label">
              Adds a <code>noindex, nofollow</code> robots tag so this page is not indexed.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={noindex}
            aria-label="Hide from search engines"
            onClick={() => onNoindexChange(!noindex)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              noindex ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
                noindex ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </AdminPanel>
    </div>
  );
}
