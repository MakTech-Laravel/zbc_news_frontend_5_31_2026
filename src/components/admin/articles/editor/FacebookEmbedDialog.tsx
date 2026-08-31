import * as React from "react";
import { Loader2, MonitorPlay } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  resolveFacebookEmbedUrl,
  validateFacebookUrl,
  isPortraitAspectRatio,
  type VideoEmbedPayload,
} from "./articleEditorMediaUtils";

type FacebookEmbedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (payload: VideoEmbedPayload) => void;
  mode?: "insert" | "replace";
};

export function FacebookEmbedDialog({
  open,
  onOpenChange,
  onInsert,
  mode = "insert",
}: FacebookEmbedDialogProps) {
  const [url, setUrl] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewEmbedUrl, setPreviewEmbedUrl] = React.useState<string | null>(null);
  const [previewAspectRatio, setPreviewAspectRatio] = React.useState("16 / 9");

  React.useEffect(() => {
    if (!open) {
      setUrl("");
      setTesting(false);
      setError(null);
      setPreviewEmbedUrl(null);
      setPreviewAspectRatio("16 / 9");
    }
  }, [open]);

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setPreviewEmbedUrl(null);

    const result = await validateFacebookUrl(url);
    setTesting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPreviewEmbedUrl(result.embedUrl);
    setPreviewAspectRatio(result.aspectRatio);
  };

  const handleInsert = () => {
    const embedUrl = previewEmbedUrl ?? resolveFacebookEmbedUrl(url);
    if (!embedUrl) {
      setError("Wrong URL. Use a Facebook watch, videos, reel, or fb.watch link.");
      return;
    }
    if (!previewEmbedUrl) {
      void (async () => {
        setTesting(true);
        const result = await validateFacebookUrl(url);
        setTesting(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onInsert({ embedUrl: result.embedUrl, aspectRatio: result.aspectRatio });
        onOpenChange(false);
      })();
      return;
    }
    onInsert({ embedUrl, aspectRatio: previewAspectRatio });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b border-admin-input-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-admin-heading">
            <MonitorPlay className="size-4" aria-hidden />
            {mode === "replace" ? "Replace with Facebook video" : "Insert Facebook video"}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <label
              htmlFor="facebook-embed-url"
              className="text-xs font-semibold uppercase tracking-wide text-admin-label"
            >
              Facebook video URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="facebook-embed-url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                  setPreviewEmbedUrl(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleTest();
                  }
                }}
                placeholder="https://www.facebook.com/watch/?v=… or fb.watch/…"
                className="flex-1"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleTest()}
                disabled={testing || !url.trim()}
                className="shrink-0 gap-2"
              >
                {testing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Test
              </Button>
            </div>
            <p className="text-xs text-admin-trend-muted">
              Paste a Facebook watch, videos, reel, or fb.watch link, then click Test to preview.
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="max-h-[min(50vh,480px)] overflow-y-auto overscroll-contain rounded-lg border border-admin-input-border bg-muted/40">
            {previewEmbedUrl ? (
              <div className="relative w-full" style={{ aspectRatio: previewAspectRatio }}>
                <iframe
                  src={previewEmbedUrl}
                  title="Facebook preview"
                  className="absolute inset-0 size-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-admin-trend-muted">
                {testing
                  ? "Checking video…"
                  : "Preview appears here after a successful Test."}
              </div>
            )}
          </div>
          {previewEmbedUrl && isPortraitAspectRatio(previewAspectRatio) ? (
            <p className="text-xs text-admin-trend-muted">Scroll the preview to see the full video.</p>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-admin-input-border px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            disabled={testing || (!previewEmbedUrl && !url.trim())}
          >
            {mode === "replace" ? "Replace video" : "Insert video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
