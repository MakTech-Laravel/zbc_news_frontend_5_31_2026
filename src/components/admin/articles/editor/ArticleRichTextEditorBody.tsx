import * as React from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";

import { ArticleEditorMediaStylePanel } from "./ArticleEditorMediaStylePanel";
import { sanitizeArticleEditorHtml } from "./articleEditorHtmlSanitizer";
import {
  applyMediaStyle,
  buildEmbedHtmlFromVideoUrl,
  clearMediaSelection,
  extractEmbeddableVideoUrl,
  notifyEditorInput,
  resolveEditorMediaFromTarget,
  selectMediaElement,
  type EditorMediaElement,
} from "./articleEditorMediaUtils";

type ArticleRichTextEditorBodyProps = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  content: string;
  onContentChange: (value: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onRequestVideoReplace?: (media: EditorMediaElement) => void;
  pendingSelectMedia?: EditorMediaElement | null;
  onPendingSelectHandled?: () => void;
  suppressMediaPanel?: boolean;
  isReplaceFlowActive?: boolean;
  className?: string;
};

export function ArticleRichTextEditorBody({
  editorRef,
  content,
  onContentChange,
  onUndo,
  onRedo,
  onRequestVideoReplace,
  pendingSelectMedia,
  onPendingSelectHandled,
  suppressMediaPanel = false,
  isReplaceFlowActive = false,
  className,
}: ArticleRichTextEditorBodyProps) {
  const [selectedMedia, setSelectedMedia] = React.useState<EditorMediaElement | null>(null);

  React.useEffect(() => {
    if (!pendingSelectMedia || !editorRef.current?.contains(pendingSelectMedia)) return;
    selectMediaElement(pendingSelectMedia, editorRef.current);
    setSelectedMedia(pendingSelectMedia);
    onPendingSelectHandled?.();
  }, [editorRef, onPendingSelectHandled, pendingSelectMedia]);

  React.useEffect(() => {
    if (!suppressMediaPanel) return;
    if (editorRef.current) clearMediaSelection(editorRef.current);
    setSelectedMedia(null);
  }, [editorRef, suppressMediaPanel]);

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el || selectedMedia || suppressMediaPanel || isReplaceFlowActive || el.innerHTML === content) {
      return;
    }
    el.innerHTML = content;
  }, [content, editorRef, isReplaceFlowActive, selectedMedia, suppressMediaPanel]);

  React.useEffect(() => {
    if (!selectedMedia) return;
    if (!editorRef.current?.contains(selectedMedia)) {
      setSelectedMedia(null);
    }
  }, [content, editorRef, selectedMedia]);

  const syncContent = React.useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = selectedMedia;
    clearMediaSelection(editor);
    onContentChange(editor.innerHTML);
    if (current && editor.contains(current)) {
      selectMediaElement(current, editor);
    }
    notifyEditorInput(editor);
  }, [editorRef, onContentChange, selectedMedia]);

  const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const media = resolveEditorMediaFromTarget(event.target);

    if (media && editorRef.current?.contains(media)) {
      event.preventDefault();
      selectMediaElement(media, editorRef.current);
      setSelectedMedia(media);
      return;
    }

    if (selectedMedia && editorRef.current) {
      clearMediaSelection(editorRef.current);
      setSelectedMedia(null);
    }
  };

  const handleApplyStyle = React.useCallback(
    (style: Parameters<typeof applyMediaStyle>[1]) => {
      if (!selectedMedia || !editorRef.current?.contains(selectedMedia)) return;
      applyMediaStyle(selectedMedia, style);
      syncContent();
    },
    [editorRef, selectedMedia, syncContent],
  );

  const handleAltChange = React.useCallback(
    (alt: string) => {
      if (!(selectedMedia instanceof HTMLImageElement)) return;
      if (!editorRef.current?.contains(selectedMedia)) return;
      selectedMedia.alt = alt;
      syncContent();
    },
    [editorRef, selectedMedia, syncContent],
  );

  const handleDeleteMedia = React.useCallback(() => {
    if (!selectedMedia || !editorRef.current) return;
    const target = selectedMedia.closest("figure.article-figure") ?? selectedMedia;
    target.remove();
    setSelectedMedia(null);
    syncContent();
  }, [editorRef, selectedMedia, syncContent]);

  const handleClosePanel = React.useCallback(() => {
    if (editorRef.current) {
      clearMediaSelection(editorRef.current);
      onContentChange(editorRef.current.innerHTML);
    }
    setSelectedMedia(null);
  }, [editorRef, onContentChange]);

  const handleRequestVideoReplace = React.useCallback(
    (media: EditorMediaElement) => {
      if (!onRequestVideoReplace || !editorRef.current?.contains(media)) return;
      clearMediaSelection(editorRef.current);
      setSelectedMedia(null);
      onRequestVideoReplace(media);
    },
    [editorRef, onRequestVideoReplace],
  );

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const plain = event.clipboardData.getData("text/plain");
    const html = event.clipboardData.getData("text/html");
    const videoUrl = extractEmbeddableVideoUrl(plain);

    if (!html.trim() && videoUrl) {
      event.preventDefault();
      const editor = editorRef.current;
      if (!editor) return;

      void (async () => {
        const embedHtml = await buildEmbedHtmlFromVideoUrl(videoUrl);
        if (!embedHtml) {
          toast.error("Could not embed this video. Check the URL or use the Video button.");
          return;
        }

        document.execCommand("insertHTML", false, embedHtml);
        onContentChange(editor.innerHTML);

        const inserted = editor.querySelector(".article-embed:last-of-type");
        if (inserted instanceof HTMLElement) {
          selectMediaElement(inserted, editor);
          setSelectedMedia(inserted);
        }
      })();
      return;
    }

    if (!html.trim()) return;

    event.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;

    // Sanitize pasted HTML only — never rewrite the live DOM on normal typing,
    // or the caret jumps to the top (browser HTML ≠ sanitizer serialization).
    const sanitized = sanitizeArticleEditorHtml(html);
    if (!sanitized) return;

    document.execCommand("insertHTML", false, sanitized);
    onContentChange(editor.innerHTML);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isMod = event.metaKey || event.ctrlKey;
    if (!isMod) return;

    const key = event.key.toLowerCase();
    if (key === "z" && event.shiftKey) {
      event.preventDefault();
      onRedo?.();
      return;
    }
    if (key === "z") {
      event.preventDefault();
      onUndo?.();
      return;
    }
    if (key === "y") {
      event.preventDefault();
      onRedo?.();
    }
  };

  return (
    <>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        data-placeholder="Write your story…"
        onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
        onPaste={handlePaste}
        onClick={handleEditorClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "article-editor-body min-h-[280px] px-4 py-4 text-base leading-relaxed text-admin-heading outline-none empty:before:pointer-events-none empty:before:text-admin-trend-muted empty:before:content-[attr(data-placeholder)] sm:min-h-[360px] sm:px-6 sm:py-6",
          "[&_img]:cursor-pointer [&_video]:cursor-pointer [&_audio]:cursor-pointer",
          "[&_.article-embed--youtube]:cursor-pointer [&_.article-embed--youtube]:my-4",
          "[&_.article-embed--facebook]:cursor-pointer [&_.article-embed--facebook]:my-4",
          "[&_.article-embed]:relative [&_.article-embed]:max-w-full [&_.article-embed]:w-full [&_.article-embed]:overflow-hidden",
          "[&_.article-embed:not([style*='aspect-ratio'])]:aspect-video",
          "[&_.article-embed[data-embed-orientation=portrait]]:mx-auto",
          "[&_.article-embed[data-embed-orientation=portrait]]:max-w-[min(100%,420px)]",
          "[&_.article-embed_iframe]:absolute [&_.article-embed_iframe]:inset-0 [&_.article-embed_iframe]:size-full [&_.article-embed_iframe]:border-0",
          "[&_.article-embed--youtube_iframe]:pointer-events-none",
          "[&_.article-embed--facebook_iframe]:pointer-events-none",
          "[&_.article-editor-media-selected]:outline [&_.article-editor-media-selected]:outline-2 [&_.article-editor-media-selected]:outline-zbc-blue [&_.article-editor-media-selected]:outline-offset-2",
          "[&_figure.article-figure]:my-4",
          "[&_figure.article-figure_figcaption]:mt-2 [&_figure.article-figure_figcaption]:text-sm [&_figure.article-figure_figcaption]:text-admin-trend-muted",
          "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-admin-input-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-admin-input-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold",
          className,
        )}
      />

      {selectedMedia && !suppressMediaPanel ? (
        <ArticleEditorMediaStylePanel
          media={selectedMedia}
          onApply={handleApplyStyle}
          onDelete={handleDeleteMedia}
          onClose={handleClosePanel}
          onReplace={
            onRequestVideoReplace ? () => handleRequestVideoReplace(selectedMedia) : undefined
          }
          onAltChange={
            selectedMedia instanceof HTMLImageElement ? handleAltChange : undefined
          }
        />
      ) : null}
    </>
  );
}
