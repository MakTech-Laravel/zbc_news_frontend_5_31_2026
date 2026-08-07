import * as React from "react";
import { ChevronDown, ChevronUp, FileText, FolderOpen, X } from "lucide-react";

import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminMediaRow } from "@/services/admin/media";

export type ArticleAttachmentItem = {
  id?: number;
  uuid: string;
  label: string;
  url?: string;
  mimeType?: string;
  extension?: string;
  size?: number | null;
  humanSize?: string;
};

type ArticleAttachmentsFieldProps = {
  value: ArticleAttachmentItem[];
  onChange: (value: ArticleAttachmentItem[]) => void;
  className?: string;
};

export function parseAttachmentsFromApi(raw: unknown): ArticleAttachmentItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const uuid = typeof row.uuid === "string" ? row.uuid : "";
      if (!uuid) return null;

      return {
        id: typeof row.id === "number" ? row.id : undefined,
        uuid,
        label:
          (typeof row.label === "string" && row.label) ||
          (typeof row.name === "string" && row.name) ||
          "Document",
        url: typeof row.url === "string" ? row.url : undefined,
        mimeType:
          typeof row.mime_type === "string"
            ? row.mime_type
            : typeof row.mimeType === "string"
              ? row.mimeType
              : undefined,
        extension: typeof row.extension === "string" ? row.extension : undefined,
        size:
          typeof row.size === "number"
            ? row.size
            : typeof row.size === "string"
              ? Number(row.size)
              : null,
        humanSize:
          typeof row.human_size === "string"
            ? row.human_size
            : typeof row.humanSize === "string"
              ? row.humanSize
              : undefined,
      } satisfies ArticleAttachmentItem;
    })
    .filter((item): item is ArticleAttachmentItem => item !== null);
}

export function attachmentsToPayload(
  items: ArticleAttachmentItem[],
): Array<{ uuid: string; label: string }> {
  return items.map((item) => ({
    uuid: item.uuid,
    label: item.label.trim() || "Document",
  }));
}

export function ArticleAttachmentsField({
  value,
  onChange,
  className,
}: ArticleAttachmentsFieldProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const handlePick = (item: AdminMediaRow) => {
    if (value.some((existing) => existing.uuid === item.uuid)) return;
    onChange([
      ...value,
      {
        uuid: item.uuid,
        label: item.name || item.fileName || "Document",
        url: item.url || undefined,
        mimeType: item.mimeType || undefined,
        size: item.size,
      },
    ]);
  };

  const updateLabel = (uuid: string, label: string) => {
    onChange(value.map((item) => (item.uuid === uuid ? { ...item, label } : item)));
  };

  const removeItem = (uuid: string) => {
    onChange(value.filter((item) => item.uuid !== uuid));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= value.length) return;
    const next = [...value];
    const [removed] = next.splice(index, 1);
    next.splice(nextIndex, 0, removed);
    onChange(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li
              key={item.uuid}
              className="flex flex-col gap-2 rounded-[10px] border border-admin-input-border bg-white p-3"
            >
              <div className="flex items-start gap-2">
                <FileText className="mt-2 size-4 shrink-0 text-admin-trend-muted" aria-hidden />
                <div className="min-w-0 flex-1 space-y-1">
                  <Input
                    value={item.label}
                    onChange={(e) => updateLabel(item.uuid, e.target.value)}
                    placeholder="Attachment label"
                    className={cn(settingsInputClassName, "h-9")}
                    aria-label="Attachment label"
                  />
                  <p className="truncate text-xs text-admin-trend-muted">
                    {[item.extension?.toUpperCase(), item.humanSize || item.mimeType]
                      .filter(Boolean)
                      .join(" · ") || item.uuid}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    title="Move up"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    className="inline-flex size-7 items-center justify-center rounded-md text-admin-heading hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    aria-label="Move down"
                    disabled={index === value.length - 1}
                    onClick={() => moveItem(index, 1)}
                    className="inline-flex size-7 items-center justify-center rounded-md text-admin-heading hover:bg-muted disabled:opacity-40"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  title="Remove attachment"
                  aria-label="Remove attachment"
                  onClick={() => removeItem(item.uuid)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-destructive hover:bg-destructive/5"
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-admin-input-border bg-white px-4 py-6 text-center">
          <FileText className="size-8 text-admin-label" aria-hidden />
          <span className="text-sm font-medium text-admin-heading">No attachments</span>
          <span className="text-xs text-admin-trend-muted">
            Attach PDFs or other documents for readers to download
          </span>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-9 gap-2 rounded-[10px] border-admin-input-border"
        onClick={() => setPickerOpen(true)}
      >
        <FolderOpen className="size-4" aria-hidden />
        Add document
      </Button>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePick}
        filter="document"
        title="Select document"
      />
    </div>
  );
}
