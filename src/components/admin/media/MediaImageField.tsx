import { FolderOpen, Link2, X } from "lucide-react";
import * as React from "react";

import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import type { AdminMediaRow } from "@/services/admin/media";

type MediaImageFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
  uploadLabel?: string;
  previewAlt?: string;
  urlPlaceholder?: string;
  pickerFilter?: "image" | "all";
  variant?: "default" | "avatar";
};

export function MediaImageField({
  value,
  onChange,
  className,
  uploadLabel = "Select from media library",
  previewAlt = "Image preview",
  urlPlaceholder = "Or paste image URL (Cloudinary, etc.)",
  pickerFilter = "image",
  variant = "default",
}: MediaImageFieldProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [urlDraft, setUrlDraft] = React.useState(value ?? "");

  React.useEffect(() => {
    setUrlDraft(value ?? "");
  }, [value]);

  const previewUrl = value ? resolveMediaUrl(value) : null;

  const handlePick = (item: AdminMediaRow) => {
    onChange(item.url || null);
  };

  const applyUrl = () => {
    const trimmed = urlDraft.trim();
    onChange(trimmed || null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {previewUrl ? (
        variant === "avatar" ? (
          <div className="relative inline-flex size-20 overflow-hidden rounded-full border border-admin-input-border">
            <img src={previewUrl} alt={previewAlt} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setUrlDraft("");
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition hover:bg-black/50 hover:text-white"
              aria-label="Remove image"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[10px] border border-admin-input-border">
            <img
              src={previewUrl}
              alt={previewAlt}
              className="aspect-[16/10] w-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setUrlDraft("");
              }}
              className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )
      ) : variant === "avatar" ? (
        <div className="inline-flex size-20 items-center justify-center rounded-full border border-dashed border-admin-input-border bg-muted/30 text-xs text-admin-trend-muted">
          No photo
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-admin-input-border bg-white px-4 py-8 text-center">
          <FolderOpen className="size-8 text-admin-label" aria-hidden />
          <span className="text-sm font-medium text-admin-heading">No image selected</span>
          <span className="text-xs text-admin-trend-muted">
            Choose from the media library or paste a URL below
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 rounded-[10px] border-admin-input-border"
          onClick={() => setPickerOpen(true)}
        >
          <FolderOpen className="size-4" aria-hidden />
          {uploadLabel}
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Link2
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-trend-muted"
            aria-hidden
          />
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={applyUrl}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder={urlPlaceholder}
            className={cn(settingsInputClassName, "pl-9")}
          />
        </div>
        <Button type="button" variant="secondary" className="h-[42px] shrink-0" onClick={applyUrl}>
          Apply URL
        </Button>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePick}
        filter={pickerFilter}
        title="Select image"
      />
    </div>
  );
}
