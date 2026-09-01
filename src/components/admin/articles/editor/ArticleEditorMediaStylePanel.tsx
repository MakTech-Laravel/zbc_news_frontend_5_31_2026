import { AlignCenter, AlignLeft, AlignRight, RefreshCw, Trash2, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  getEditorMediaLabel,
  isExternalEmbedElement,
  MEDIA_ASPECT_RATIO_OPTIONS,
  MEDIA_OBJECT_FIT_OPTIONS,
  readMediaStyle,
  supportsObjectFit,
  supportsVideoReplace,
  type ArticleEditorMediaStyle,
  type EditorMediaElement,
  type MediaAlign,
} from "./articleEditorMediaUtils";

type ArticleEditorMediaStylePanelProps = {
  media: EditorMediaElement;
  onApply: (style: ArticleEditorMediaStyle) => void;
  onDelete: () => void;
  onClose: () => void;
  onReplace?: () => void;
  onAltChange?: (alt: string) => void;
};

function useMediaPanelPosition(media: EditorMediaElement | null) {
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 320 });

  React.useLayoutEffect(() => {
    if (!media) return;

    const update = () => {
      const rect = media.getBoundingClientRect();
      const panelWidth = Math.min(360, Math.max(280, window.innerWidth - 24));
      const left = Math.min(
        Math.max(12, rect.left),
        window.innerWidth - panelWidth - 12,
      );
      const top = Math.min(rect.bottom + 8, window.innerHeight - 12);
      setPosition({ top, left, width: panelWidth });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [media]);

  return position;
}

export function ArticleEditorMediaStylePanel({
  media,
  onApply,
  onDelete,
  onClose,
  onReplace,
  onAltChange,
}: ArticleEditorMediaStylePanelProps) {
  const [draft, setDraft] = React.useState<ArticleEditorMediaStyle>(() => readMediaStyle(media));
  const [altText, setAltText] = React.useState(() =>
    media instanceof HTMLImageElement ? media.alt : "",
  );
  const position = useMediaPanelPosition(media);
  const showObjectFit = supportsObjectFit(media);
  const showReplace = supportsVideoReplace(media) && Boolean(onReplace);
  const isImage = media instanceof HTMLImageElement;
  const isEmbed = isExternalEmbedElement(media);

  React.useEffect(() => {
    setDraft(readMediaStyle(media));
    setAltText(media instanceof HTMLImageElement ? media.alt : "");
  }, [media]);

  const updateDraft = (patch: Partial<ArticleEditorMediaStyle>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const commitDraft = () => {
    setDraft((current) => {
      onApply(current);
      return current;
    });
  };

  const setAlign = (align: MediaAlign) => {
    setDraft((current) => {
      const next = { ...current, align };
      onApply(next);
      return next;
    });
  };

  return createPortal(
    <div
      className="fixed z-40 rounded-xl border border-admin-input-border bg-white p-3 shadow-lg"
      style={{ top: position.top, left: position.left, width: position.width }}
      onMouseDown={(event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.closest("input, select, textarea, button, label")) return;
        event.preventDefault();
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-admin-heading">{getEditorMediaLabel(media)} settings</p>
          <p className="text-xs text-admin-trend-muted">
            {isEmbed
              ? "Max height keeps the full video visible (no crop)"
              : "Adjust width, ratio, and alignment"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-md text-admin-trend-muted hover:bg-muted hover:text-admin-heading"
          aria-label="Close media settings"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {isImage && onAltChange ? (
          <label className="col-span-2 space-y-1">
            <span className="text-xs font-medium text-admin-heading">Alt text</span>
            <input
              type="text"
              value={altText}
              onChange={(e) => {
                const next = e.target.value;
                setAltText(next);
                onAltChange(next);
              }}
              placeholder="Describe the image"
              className={cn(settingsInputClassName, "h-9 text-sm")}
            />
          </label>
        ) : null}
        <label className="space-y-1">
          <span className="text-xs font-medium text-admin-heading">Width</span>
          <input
            type="text"
            value={draft.width}
            onChange={(e) => updateDraft({ width: e.target.value })}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft();
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
            placeholder="100% or 640px"
            className={cn(settingsInputClassName, "h-9 text-sm")}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-admin-heading">
            {isEmbed ? "Max height" : "Height"}
          </span>
          <input
            type="text"
            value={draft.height}
            onChange={(e) => updateDraft({ height: e.target.value })}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitDraft();
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
            placeholder={isEmbed ? "auto or 250px" : "auto or 360px"}
            className={cn(settingsInputClassName, "h-9 text-sm")}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-admin-heading">Aspect ratio</span>
          <select
            value={draft.aspectRatio}
            onChange={(e) => {
              const aspectRatio = e.target.value;
              setDraft((current) => {
                const next = { ...current, aspectRatio };
                onApply(next);
                return next;
              });
            }}
            className={cn(settingsInputClassName, "h-9 text-sm")}
          >
            {MEDIA_ASPECT_RATIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {showObjectFit ? (
          <label className="space-y-1">
            <span className="text-xs font-medium text-admin-heading">Fit</span>
            <select
              value={draft.objectFit}
              onChange={(e) => {
                const objectFit = e.target.value;
                setDraft((current) => {
                  const next = { ...current, objectFit };
                  onApply(next);
                  return next;
                });
              }}
              className={cn(settingsInputClassName, "h-9 text-sm")}
            >
              {MEDIA_OBJECT_FIT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs font-medium text-admin-heading">Align</span>
          {(
            [
              ["left", AlignLeft],
              ["center", AlignCenter],
              ["right", AlignRight],
            ] as const
          ).map(([align, Icon]) => (
            <button
              key={align}
              type="button"
              title={`Align ${align}`}
              aria-label={`Align ${align}`}
              onClick={() => setAlign(align)}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-md border border-admin-input-border text-admin-heading transition-colors hover:bg-muted",
                draft.align === align && "bg-muted ring-2 ring-zbc-blue/30",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {showReplace ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onReplace}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Replace
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
