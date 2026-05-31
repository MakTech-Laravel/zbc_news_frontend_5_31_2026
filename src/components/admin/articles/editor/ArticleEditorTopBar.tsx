import { ArrowLeft, Eye, Loader2, Save, Send } from "lucide-react";

import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ARTICLE_STATUS_LABELS } from "@/data/admin/articleWorkflow";
import type { ArticleStatus } from "@/data/admin/mockArticles";

type ArticleEditorTopBarProps = {
  wordCount: number;
  charCount: number;
  status: ArticleStatus;
  lastSavedLabel: string;
  isDirty?: boolean;
  isAutoSaving?: boolean;
  onBack?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSubmitForReview?: () => void;
  onPublish?: () => void;
  className?: string;
};

function statusToBadgeVariant(
  status: ArticleStatus,
): "draft" | "scheduled" | "published" | "pending_review" | "archived" {
  return status;
}

export function ArticleEditorTopBar({
  wordCount,
  charCount,
  status,
  lastSavedLabel,
  isDirty = false,
  isAutoSaving = false,
  onBack,
  onPreview,
  onSaveDraft,
  onSubmitForReview,
  onPublish,
  className,
}: ArticleEditorTopBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-6 border-b border-admin-input-border bg-admin-surface px-4 py-3 sm:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-admin-input-border bg-white text-admin-heading transition-colors hover:bg-muted"
              aria-label="Back to articles"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge variant={statusToBadgeVariant(status)}>
                  {ARTICLE_STATUS_LABELS[status]}
                </AdminStatusBadge>
                {isDirty ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
                    Unsaved changes
                  </span>
                ) : null}
                {isAutoSaving ? (
                  <span className="inline-flex items-center gap-1 text-xs text-admin-label">
                    <Loader2 className="size-3 animate-spin" aria-hidden />
                    Auto-saving…
                  </span>
                ) : null}
              </div>
              <p className="mt-1 truncate text-xs text-admin-label sm:text-sm">
                {lastSavedLabel}
                <span className="mx-1.5 text-admin-input-border">•</span>
                <span className="font-medium text-admin-heading">{wordCount}</span> words
                <span className="mx-1.5 text-admin-input-border">•</span>
                <span className="font-medium text-admin-heading">{charCount}</span> characters
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onPreview}
              className="h-9 gap-2 rounded-[10px] border-admin-input-border px-3 text-sm font-medium text-admin-heading sm:h-10 sm:px-4"
            >
              <Eye className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              className="h-9 gap-2 rounded-[10px] border-admin-input-border px-3 text-sm font-medium text-admin-heading sm:h-10 sm:px-4"
            >
              <Save className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onSubmitForReview}
              className="h-9 gap-2 rounded-[10px] border-admin-input-border px-3 text-sm font-medium text-admin-heading sm:h-10 sm:px-4"
            >
              <Send className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Submit Review</span>
            </Button>

            <Button
              type="button"
              onClick={onPublish}
              className="h-9 rounded-[10px] bg-zbc-blue px-4 text-sm font-medium hover:bg-zbc-blue/90 sm:h-10 sm:px-5"
            >
              Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
