import { FolderOpen, ImagePlus, X } from "lucide-react";
import { useState } from "react";

import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import type { AdminMediaRow } from "@/services/admin/media";

type CareersPerkIconFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  alt?: string;
};

export function CareersPerkIconField({
  value,
  onChange,
  disabled = false,
  alt = "Perk icon",
}: CareersPerkIconFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const previewUrl = value ? resolveMediaUrl(value) : "";

  function handlePick(item: AdminMediaRow) {
    onChange(item.url || null);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setPickerOpen(true)}
        className={cn(
          "group relative flex size-12 items-center justify-center overflow-hidden rounded-lg border border-dashed border-admin-input-border bg-muted/30 transition-colors",
          !disabled && "hover:border-zbc-blue hover:bg-zbc-blue/5",
          disabled && "cursor-not-allowed opacity-60",
        )}
        aria-label={previewUrl ? "Change icon" : "Select icon"}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={alt}
            width={48}
            height={48}
            className="size-12 object-contain"
          />
        ) : (
          <ImagePlus className="size-5 text-admin-label group-hover:text-zbc-blue" />
        )}
      </button>

      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => setPickerOpen(true)}
        >
          <FolderOpen className="size-3.5" />
          {previewUrl ? "Change" : "Choose"}
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="h-7 gap-1 px-2 text-xs text-admin-label"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePick}
        filter="image"
        title="Select perk icon"
      />
    </div>
  );
}
