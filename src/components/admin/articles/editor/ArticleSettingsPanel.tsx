import { Plus, X } from "lucide-react";

import { ARTICLE_EDITOR_AUTHORS } from "@/components/admin/articles/editor/types";
import { getArticleEditorCategoryOptions } from "@/data/admin/categoryStore";
import type { UseArticleWorkflowReturn } from "@/components/admin/articles/editor/useArticleWorkflow";
import { ARTICLE_STATUS_LABELS, ARTICLE_WORKFLOW_STATUSES } from "@/data/admin/articleWorkflow";
import type { ArticleStatus } from "@/data/admin/mockArticles";
import { FeaturedImageUpload } from "@/components/admin/articles/editor/FeaturedImageUpload";
import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/forms/AdminFormSelect";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ArticleSettingsPanelProps = {
  editor: UseArticleWorkflowReturn;
  status: ArticleStatus;
  onStatusChange: (status: ArticleStatus) => void;
  onArchive: () => void;
  className?: string;
};

const inputClassName =
  "h-10 w-full rounded-[10px] border border-admin-input-border bg-white px-3 text-sm text-admin-heading outline-none placeholder:text-admin-trend-muted focus-visible:ring-2 focus-visible:ring-zbc-blue/30";

export function ArticleSettingsPanel({
  editor,
  status,
  onStatusChange,
  onArchive,
  className,
}: ArticleSettingsPanelProps) {
  const {
    form,
    tagInput,
    setTagInput,
    excerptMaxLength,
    setField,
    setSlug,
    setExcerpt,
    addTag,
    removeTag,
    setFeaturedImage,
  } = editor;

  return (
    <AdminPanel className={cn("h-fit shadow-sm", className)}>
      <h2 className="mb-4 text-lg font-semibold text-admin-heading">Article Settings</h2>

      <div className="flex flex-col gap-5">
        <AdminFormField label="Workflow status" htmlFor="article-workflow-status">
          <AdminFormSelect
            id="article-workflow-status"
            value={status}
            onChange={(v) => onStatusChange(v as ArticleStatus)}
            options={[
              { value: "", label: "Select status" },
              ...ARTICLE_WORKFLOW_STATUSES.map((value) => ({
                value,
                label: ARTICLE_STATUS_LABELS[value],
              })),
            ]}
          />
        </AdminFormField>

        {status !== "archived" ? (
          <Button
            type="button"
            variant="outline"
            onClick={onArchive}
            className="h-10 w-full rounded-[10px] border-admin-input-border text-sm text-admin-heading"
          >
            Archive article
          </Button>
        ) : null}
        <AdminFormField label="Featured Image">
          <FeaturedImageUpload
            previewUrl={form.featuredImagePreview}
            onFileSelect={setFeaturedImage}
          />
        </AdminFormField>

        <AdminFormField label="Category" htmlFor="article-category">
          <AdminFormSelect
            id="article-category"
            value={form.category}
            onChange={(v) => setField("category", v)}
            options={getArticleEditorCategoryOptions()}
          />
        </AdminFormField>

        <AdminFormField label="Tags">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag"
              className={cn(inputClassName, "min-w-0 flex-1")}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addTag}
              className="h-10 shrink-0 gap-1 rounded-[10px] border-admin-input-border px-3"
            >
              <Plus className="size-4" aria-hidden />
              Add
            </Button>
          </div>
          {form.tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-admin-heading"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 hover:bg-admin-input-border/50"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </AdminFormField>

        <AdminFormField
          label="Excerpt"
          hint={`${form.excerpt.length}/${excerptMaxLength} characters`}
        >
          <textarea
            value={form.excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={4}
            maxLength={excerptMaxLength}
            placeholder="Brief summary for listings and SEO…"
            className={cn(
              inputClassName,
              "h-auto min-h-[96px] resize-y py-2.5",
            )}
          />
        </AdminFormField>

        <AdminFormField label="URL Slug" htmlFor="article-slug">
          <input
            id="article-slug"
            type="text"
            value={form.slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="article-url-slug"
            className={inputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Schedule Publishing" htmlFor="article-schedule">
          <input
            id="article-schedule"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setField("scheduledAt", e.target.value)}
            className={inputClassName}
          />
        </AdminFormField>

        <AdminFormField label="Author" htmlFor="article-author">
          <AdminFormSelect
            id="article-author"
            value={form.authorId}
            onChange={(v) => setField("authorId", v)}
            options={ARTICLE_EDITOR_AUTHORS}
          />
        </AdminFormField>
      </div>
    </AdminPanel>
  );
}
