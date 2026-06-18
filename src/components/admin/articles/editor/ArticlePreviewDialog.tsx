import { Calendar, Clock, Tag } from "lucide-react";

import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ARTICLE_STATUS_LABELS } from "@/data/admin/articleWorkflow";
import type { ArticleStatus } from "@/data/admin/mockArticles";
import { formatPublishDate } from "@/lib/publishDate";
import { cn } from "@/lib/utils";

export type ArticlePreviewData = {
  title: string;
  article_description: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  featuredImageUrl: string | null;
  status: ArticleStatus;
  publishDisplayAt?: string;
};

type ArticlePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: ArticlePreviewData;
};

function statusToBadgeVariant(
  status: ArticleStatus,
): "draft" | "scheduled" | "published" | "pending_review" | "archived" {
  return status;
}

export function ArticlePreviewDialog({
  open,
  onOpenChange,
  preview,
}: ArticlePreviewDialogProps) {
  const displayTitle = (preview.title ?? "").trim() || "Untitled article";
  const displayExcerpt = (preview.excerpt ?? "").trim();
  const displayDescription = (preview.article_description ?? "").trim();
  const displayTags = preview.tags ?? [];
  const publishParts = formatPublishDate(
    preview.publishDisplayAt ?? new Date().toISOString(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,100%)] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden",
          "border-admin-input-border bg-background p-0 sm:w-full",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-admin-input-border px-4 py-4 pr-12 text-left sm:px-6">
          <DialogTitle className="text-lg font-semibold text-admin-heading">
            Article preview
          </DialogTitle>
          <p className="text-sm text-admin-label">
            This is how your article may appear on the site.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zbc-gray-50 px-4 py-6 sm:px-8 sm:py-8">
          <article className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-background shadow-sm">
            {preview.featuredImageUrl ? (
              <figure className="overflow-hidden rounded-t-xl">
                <img
                  src={preview.featuredImageUrl}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            ) : null}

            <div className="space-y-5 p-5 sm:space-y-6 sm:p-8">
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {preview.category ? (
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {preview.category}
                    </span>
                  ) : null}
                  <AdminStatusBadge variant={statusToBadgeVariant(preview.status)}>
                    {ARTICLE_STATUS_LABELS[preview.status]}
                  </AdminStatusBadge>
                </div>

                <h1 className="text-2xl font-bold leading-tight text-zbc-gray-1000 sm:text-3xl">
                  {displayTitle}
                </h1>

                {displayExcerpt ? (
                  <p className="text-base leading-relaxed text-zbc-gray-700 sm:text-lg">
                    {preview.excerpt}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm text-zbc-gray-500">
                  <span className="font-medium text-zbc-gray-1000">
                    {preview.authorName || "Unknown author"}
                  </span>
                  {publishParts.date ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4 shrink-0" aria-hidden />
                      <time dateTime={publishParts.iso}>{publishParts.date}</time>
                    </span>
                  ) : null}
                  {publishParts.time ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4 shrink-0" aria-hidden />
                      <time dateTime={publishParts.iso}>{publishParts.time}</time>
                    </span>
                  ) : null}
                </div>
              </header>

              <div
                className={cn(
                  "article-preview-body space-y-4 border-t border-border pt-6",
                  "text-base leading-relaxed text-zbc-gray-700",
                  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zbc-gray-1000",
                  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zbc-gray-1000",
                  "[&_p]:leading-[1.75] [&_strong]:font-semibold [&_em]:italic",
                  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
                  "[&_a]:text-primary [&_a]:underline",
                  "[&_img]:my-4 [&_img]:max-h-[420px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-cover",
                )}
                dangerouslySetInnerHTML={{
                  __html:
                    displayDescription ||
                    "<p class='text-zbc-gray-500'>No content yet. Add body copy in the editor.</p>",
                }}
              />

              {displayTags.length > 0 ? (
                <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
                  <Tag className="size-4 text-zbc-gray-400" aria-hidden />
                  {displayTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-admin-heading"
                    >
                      {tag}
                    </span>
                  ))}
                </footer>
              ) : null}
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
