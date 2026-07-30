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
  resolveYouTubeEmbedUrl,
  validateYouTubeUrl,
} from "./articleEditorMediaUtils";

type YouTubeEmbedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (embedUrl: string) => void;
};

export function YouTubeEmbedDialog({
  open,
  onOpenChange,
  onInsert,
}: YouTubeEmbedDialogProps) {
  const [url, setUrl] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewEmbedUrl, setPreviewEmbedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setUrl("");
      setTesting(false);
      setError(null);
      setPreviewEmbedUrl(null);
    }
  }, [open]);

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setPreviewEmbedUrl(null);

    const result = await validateYouTubeUrl(url);
    setTesting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPreviewEmbedUrl(result.embedUrl);
  };

  const handleInsert = () => {
    const embedUrl = previewEmbedUrl ?? resolveYouTubeEmbedUrl(url);
    if (!embedUrl) {
      setError("Wrong URL. Use a YouTube watch, share, live, or youtu.be link.");
      return;
    }
    if (!previewEmbedUrl) {
      void (async () => {
        setTesting(true);
        const result = await validateYouTubeUrl(url);
        setTesting(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onInsert(result.embedUrl);
        onOpenChange(false);
      })();
      return;
    }
    onInsert(embedUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0 sm:rounded-xl">
        <DialogHeader className="border-b border-admin-input-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-admin-heading">
            <MonitorPlay className="size-4" aria-hidden />
            Insert YouTube video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <label
              htmlFor="youtube-embed-url"
              className="text-xs font-semibold uppercase tracking-wide text-admin-label"
            >
              YouTube URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="youtube-embed-url"
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
                placeholder="https://www.youtube.com/watch?v=… or live URL"
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
              Paste a watch, share, live, Shorts, or youtu.be link, then click Test to preview.
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

          <div className="overflow-hidden rounded-lg border border-admin-input-border bg-muted/40">
            {previewEmbedUrl ? (
              <div className="relative aspect-video w-full">
                <iframe
                  src={previewEmbedUrl}
                  title="YouTube preview"
                  className="absolute inset-0 size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
        </div>

        <DialogFooter className="border-t border-admin-input-border px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            disabled={testing || (!previewEmbedUrl && !url.trim())}
          >
            Insert video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
