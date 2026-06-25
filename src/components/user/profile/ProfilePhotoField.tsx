import { Link2, Upload, X } from "lucide-react";
import * as React from "react";

import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";

type ProfilePhotoFieldProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  onFileChange: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/jpg,image/gif,image/webp";

export function ProfilePhotoField({
  value,
  onChange,
  onFileChange,
  className,
  disabled = false,
}: ProfilePhotoFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = React.useState(value ?? "");
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    setUrlDraft(value ?? "");
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const previewUrl = localPreview ?? (value ? resolveMediaUrl(value) : null);

  const applyUrl = () => {
    const trimmed = urlDraft.trim();
    onFileChange(null);
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    onChange(trimmed || null);
  };

  const clearPhoto = () => {
    onChange(null);
    onFileChange(null);
    setUrlDraft("");
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalPreview(URL.createObjectURL(file));
    onFileChange(file);
    onChange(null);
    setUrlDraft("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      {previewUrl ? (
        <div className="relative inline-flex size-20 overflow-hidden rounded-full border border-admin-input-border">
          <img src={previewUrl} alt="Profile photo" className="size-full object-cover" />
          <button
            type="button"
            onClick={clearPhoto}
            disabled={disabled}
            className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition hover:bg-black/50 hover:text-white disabled:pointer-events-none"
            aria-label="Remove profile photo"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="inline-flex size-20 items-center justify-center rounded-full border border-dashed border-admin-input-border bg-muted/30 text-xs text-admin-trend-muted">
          No photo
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="sr-only"
        disabled={disabled}
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 rounded-[10px] border-admin-input-border"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden />
          Upload profile photo
        </Button>

        {/* Media library picker disabled for user profile — use upload instead.
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          <FolderOpen className="size-4" aria-hidden />
          Select profile photo
        </Button>
        */}
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
            disabled={disabled}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={applyUrl}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder="Or paste profile image URL"
            className={cn(settingsInputClassName, "pl-9")}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-[42px] shrink-0"
          disabled={disabled}
          onClick={applyUrl}
        >
          Apply URL
        </Button>
      </div>
    </div>
  );
}
