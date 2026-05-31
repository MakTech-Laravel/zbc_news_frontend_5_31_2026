import { ImagePlus, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type FeaturedImageUploadProps = {
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
};

export function FeaturedImageUpload({
  previewUrl,
  onFileSelect,
  className,
}: FeaturedImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file?.type.startsWith("image/")) return;
    onFileSelect(file);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-[10px] border border-admin-input-border">
          <img
            src={previewUrl}
            alt="Featured preview"
            className="aspect-[16/10] w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Remove featured image"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-admin-input-border bg-white px-4 py-8 text-center transition-colors",
            dragOver && "border-zbc-blue bg-zbc-blue/5",
          )}
        >
          <ImagePlus className="size-8 text-admin-label" aria-hidden />
          <span className="text-sm font-medium text-admin-heading">Upload featured image</span>
          <span className="text-xs text-admin-trend-muted">PNG, JPG up to 5MB</span>
        </button>
      )}
    </div>
  );
}
