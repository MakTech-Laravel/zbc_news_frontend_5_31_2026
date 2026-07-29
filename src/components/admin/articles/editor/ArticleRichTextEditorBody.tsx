import * as React from "react";

import { cn } from "@/lib/utils";

import { ArticleEditorMediaStylePanel } from "./ArticleEditorMediaStylePanel";
import {
  applyMediaStyle,
  clearMediaSelection,
  isEditorMediaElement,
  notifyEditorInput,
  selectMediaElement,
  type EditorMediaElement,
} from "./articleEditorMediaUtils";

type ArticleRichTextEditorBodyProps = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  content: string;
  onContentChange: (value: string) => void;
  className?: string;
};

export function ArticleRichTextEditorBody({
  editorRef,
  content,
  onContentChange,
  className,
}: ArticleRichTextEditorBodyProps) {
  const [selectedMedia, setSelectedMedia] = React.useState<EditorMediaElement | null>(null);

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el || selectedMedia || el.innerHTML === content) return;
    el.innerHTML = content;
  }, [content, editorRef, selectedMedia]);

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
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const media = isEditorMediaElement(target)
      ? target
      : target.closest("img, video, audio");

    if (isEditorMediaElement(media) && editorRef.current?.contains(media)) {
      event.preventDefault();
      selectMediaElement(media, editorRef.current);
      setSelectedMedia(media);
      return;
    }

    if (selectedMedia) {
      clearMediaSelection(editorRef.current!);
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

  const handleDeleteMedia = React.useCallback(() => {
    if (!selectedMedia || !editorRef.current) return;
    selectedMedia.remove();
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
        onClick={handleEditorClick}
        className={cn(
          "article-editor-body min-h-[280px] px-4 py-4 text-base leading-relaxed text-admin-heading outline-none empty:before:pointer-events-none empty:before:text-admin-trend-muted empty:before:content-[attr(data-placeholder)] sm:min-h-[360px] sm:px-6 sm:py-6",
          "[&_img]:cursor-pointer [&_video]:cursor-pointer [&_audio]:cursor-pointer",
          "[&_.article-editor-media-selected]:outline [&_.article-editor-media-selected]:outline-2 [&_.article-editor-media-selected]:outline-zbc-blue [&_.article-editor-media-selected]:outline-offset-2",
          "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-admin-input-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-admin-input-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold",
          className,
        )}
      />

      {selectedMedia ? (
        <ArticleEditorMediaStylePanel
          media={selectedMedia}
          onApply={handleApplyStyle}
          onDelete={handleDeleteMedia}
          onClose={handleClosePanel}
        />
      ) : null}
    </>
  );
}
