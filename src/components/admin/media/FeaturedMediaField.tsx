import * as React from "react";
import { FolderOpen, Link2, Music2, Radio, Video, X } from "lucide-react";

import { YouTubeEmbedDialog } from "@/components/admin/articles/editor/YouTubeEmbedDialog";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import {
  isAudioMedia,
  isImageMedia,
  isVideoMedia,
  type AdminMediaRow,
} from "@/services/admin/media";

export type FeaturedMediaType = "image" | "video" | "audio";

export type FeaturedMediaValue = {
  type: FeaturedMediaType;
  mediaUuid: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  posterUuid: string | null;
  posterUrl: string | null;
};

type FeaturedMediaFieldProps = {
  value: FeaturedMediaValue;
  onChange: (value: FeaturedMediaValue) => void;
  className?: string;
  /** Restrict visible type tabs (defaults to image/video/audio). */
  allowedTypes?: FeaturedMediaType[];
  /** Override tab labels, e.g. `{ video: "Live" }` on Live Updates editor. */
  typeLabels?: Partial<Record<FeaturedMediaType, string>>;
  /** Live Updates can collect a YouTube URL instead of library video. */
  videoSource?: "media" | "youtube";
};

const DEFAULT_TYPES: FeaturedMediaType[] = ["image", "video", "audio"];

const DEFAULT_LABELS: Record<FeaturedMediaType, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
};

const emptyValue = (type: FeaturedMediaType = "image"): FeaturedMediaValue => ({
  type,
  mediaUuid: null,
  url: null,
  thumbnailUrl: null,
  posterUuid: null,
  posterUrl: null,
});

function typeFromRow(item: AdminMediaRow): FeaturedMediaType {
  if (isVideoMedia(item)) return "video";
  if (isAudioMedia(item)) return "audio";
  return "image";
}

export function FeaturedMediaField({
  value,
  onChange,
  className,
  allowedTypes = DEFAULT_TYPES,
  typeLabels,
  videoSource = "media",
}: FeaturedMediaFieldProps) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [posterPickerOpen, setPosterPickerOpen] = React.useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = React.useState(false);

  const labels = { ...DEFAULT_LABELS, ...typeLabels };
  const videoLabel = labels.video;
  const isLiveLabel = videoLabel.toLowerCase() === "live";
  const isYouTubeVideo = value.type === "video" && videoSource === "youtube";

  const needsPoster = value.type === "video" || value.type === "audio";
  const previewSrc = resolveMediaUrl(
    value.posterUrl ||
      (value.type === "image" ? value.url : null) ||
      value.thumbnailUrl ||
      "",
  );

  const setType = (type: FeaturedMediaType) => {
    if (type === "video" && videoSource === "youtube") {
      setYoutubeDialogOpen(true);
      return;
    }
    if (type === value.type) return;
    onChange(emptyValue(type));
  };

  const handleYouTubeInsert = (embedUrl: string) => {
    onChange({
      type: "video",
      mediaUuid: null,
      url: embedUrl,
      thumbnailUrl: null,
      posterUuid: value.posterUuid,
      posterUrl: value.posterUrl,
    });
  };

  const handlePick = (item: AdminMediaRow) => {
    const type = typeFromRow(item);
    onChange({
      type,
      mediaUuid: item.uuid,
      url: item.url || null,
      thumbnailUrl: item.thumbnailUrl || item.url || null,
      posterUuid: type === "image" ? null : value.posterUuid,
      posterUrl: type === "image" ? null : value.posterUrl,
    });
  };

  const handlePosterPick = (item: AdminMediaRow) => {
    if (!isImageMedia(item)) return;
    onChange({
      ...value,
      posterUuid: item.uuid,
      posterUrl: item.url || null,
    });
  };

  const applyUrl = () => {
    const trimmed = value.url?.trim() ?? "";
    if (!trimmed) {
      onChange(emptyValue(value.type));
      return;
    }
    onChange({
      ...value,
      mediaUuid: null,
      url: trimmed,
      thumbnailUrl: trimmed,
    });
  };

  const clear = () => {
    onChange(emptyValue(value.type));
  };

  const clearPoster = () => {
    onChange({
      ...value,
      posterUuid: null,
      posterUrl: null,
    });
  };

  const typeDisplayName = labels[value.type];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-1 rounded-[10px] border border-admin-input-border bg-muted/30 p-1">
        {allowedTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setType(type)}
            className={cn(
              "h-8 flex-1 rounded-md px-2 text-xs font-medium transition-colors",
              value.type === type
                ? "bg-white text-admin-heading shadow-sm"
                : "text-admin-trend-muted hover:text-admin-heading",
            )}
          >
            {labels[type]}
          </button>
        ))}
      </div>

      {previewSrc || (value.type === "video" && value.url) || value.type === "audio" ? (
        <div className="relative max-h-48 overflow-hidden rounded-[10px] border border-admin-input-border bg-muted/20">
          {isYouTubeVideo && value.url && !value.posterUrl ? (
            <div className="relative aspect-video w-full">
              <iframe
                src={value.url}
                title="Live YouTube preview"
                className="absolute inset-0 size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : value.type === "video" && value.url && !value.posterUrl && !value.thumbnailUrl ? (
            <video
              src={resolveMediaUrl(value.url)}
              className="mx-auto max-h-48 w-auto max-w-full object-contain"
              muted
              playsInline
              preload="metadata"
            />
          ) : value.type === "audio" && !value.posterUrl ? (
            <div className="flex h-36 flex-col items-center justify-center gap-2 text-admin-trend-muted">
              <Music2 className="size-10 opacity-50" aria-hidden />
              <span className="text-xs">Audio selected — add a poster image</span>
            </div>
          ) : previewSrc ? (
            <img
              src={previewSrc}
              alt="Featured media preview"
              className="mx-auto max-h-48 w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex h-36 flex-col items-center justify-center gap-2 text-admin-trend-muted">
              {isLiveLabel ? (
                <Radio className="size-10 opacity-50" aria-hidden />
              ) : (
                <Video className="size-10 opacity-50" aria-hidden />
              )}
              <span className="text-xs">{typeDisplayName} selected</span>
            </div>
          )}
          {value.type === "video" ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
              {isLiveLabel ? (
                <Radio className="size-3" aria-hidden />
              ) : (
                <Video className="size-3" aria-hidden />
              )}
              {typeDisplayName}
            </span>
          ) : null}
          {value.type === "audio" ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
              <Music2 className="size-3" aria-hidden />
              Audio
            </span>
          ) : null}
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Remove featured media"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-admin-input-border bg-white px-4 py-8 text-center">
          <FolderOpen className="size-8 text-admin-label" aria-hidden />
          <span className="text-sm font-medium text-admin-heading">
            No {typeDisplayName.toLowerCase()} selected
          </span>
          <span className="text-xs text-admin-trend-muted">
            {value.type === "image"
              ? "Choose from the media library or paste a URL below"
              : "Choose from the media library"}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 rounded-[10px] border-admin-input-border"
          onClick={() => {
            if (isYouTubeVideo) {
              setYoutubeDialogOpen(true);
              return;
            }
            setPickerOpen(true);
          }}
        >
          <FolderOpen className="size-4" aria-hidden />
          Select {typeDisplayName.toLowerCase()}
        </Button>
      </div>

      {value.type === "image" ? (
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Link2
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-trend-muted"
              aria-hidden
            />
            <input
              type="url"
              value={value.url ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  mediaUuid: null,
                  url: e.target.value,
                  thumbnailUrl: e.target.value,
                })
              }
              onBlur={applyUrl}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
              placeholder="Or paste image URL (Cloudinary, etc.)"
              className={cn(settingsInputClassName, "pl-9")}
            />
          </div>
        </div>
      ) : null}

      {needsPoster ? (
        <div className="space-y-2 rounded-[10px] border border-admin-input-border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-admin-heading">
              Poster image (recommended)
            </label>
            {value.posterUrl ? (
              <button
                type="button"
                onClick={clearPoster}
                className="text-xs text-destructive hover:underline"
              >
                Remove poster
              </button>
            ) : null}
          </div>
          {value.posterUrl ? (
            <img
              src={resolveMediaUrl(value.posterUrl)}
              alt="Poster preview"
              className="max-h-28 w-auto rounded-md object-contain"
            />
          ) : (
            <p className="text-xs text-admin-trend-muted">
              {isLiveLabel
                ? "Shown on list cards by default; live video plays on hover."
                : "Used on cards, share previews, and before playback."}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-2 rounded-[10px] border-admin-input-border"
            onClick={() => setPosterPickerOpen(true)}
          >
            <FolderOpen className="size-3.5" aria-hidden />
            {value.posterUrl ? "Change poster" : "Select poster"}
          </Button>
        </div>
      ) : null}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePick}
        filter={value.type}
        title={`Select ${typeDisplayName.toLowerCase()}`}
      />
      <MediaPickerDialog
        open={posterPickerOpen}
        onOpenChange={setPosterPickerOpen}
        onSelect={handlePosterPick}
        filter="image"
        title="Select poster image"
      />
      <YouTubeEmbedDialog
        open={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onInsert={handleYouTubeInsert}
      />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function emptyFeaturedMediaValue(
  type: FeaturedMediaType = "image",
): FeaturedMediaValue {
  return emptyValue(type);
}
