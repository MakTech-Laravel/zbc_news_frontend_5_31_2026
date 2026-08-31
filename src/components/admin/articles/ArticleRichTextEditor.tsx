import * as React from "react";

import { ArticleRichTextEditorBody } from "@/components/admin/articles/editor/ArticleRichTextEditorBody";
import { ArticleRichTextToolbar } from "@/components/admin/articles/editor/ArticleRichTextToolbar";
import { useVideoInsert } from "@/components/admin/articles/editor/useVideoInsert";
import type { EditorMediaElement } from "@/components/admin/articles/editor/articleEditorMediaUtils";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import InputError from "@/components/input-error";
import { cn } from "@/lib/utils";

const HISTORY_MAX = 50;
const HISTORY_DEBOUNCE_MS = 300;

type ArticleRichTextEditorProps = {
  title?: string;
  onTitleChange?: (value: string) => void;
  titleError?: string;
  content: string;
  onContentChange: (value: string) => void;
  contentError?: string;
  /** When true, omit the title input (for timeline entry bodies). */
  hideTitle?: boolean;
  className?: string;
};

export function ArticleRichTextEditor({
  title = "",
  onTitleChange,
  titleError,
  content,
  onContentChange,
  contentError,
  hideTitle = false,
  className,
}: ArticleRichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const historyRef = React.useRef<string[]>([content]);
  const indexRef = React.useRef(0);
  const applyingHistoryRef = React.useRef(false);
  const fromEditorRef = React.useRef(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [pendingSelectMedia, setPendingSelectMedia] = React.useState<EditorMediaElement | null>(
    null,
  );

  const refreshFlags = React.useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const pushSnapshot = React.useCallback(
    (html: string) => {
      if (applyingHistoryRef.current) return;
      const stack = historyRef.current;
      const idx = indexRef.current;
      if (idx >= 0 && stack[idx] === html) return;

      const next = stack.slice(0, idx + 1);
      next.push(html);
      while (next.length > HISTORY_MAX) {
        next.shift();
      }
      historyRef.current = next;
      indexRef.current = next.length - 1;
      refreshFlags();
    },
    [refreshFlags],
  );

  const schedulePush = React.useCallback(
    (html: string) => {
      if (applyingHistoryRef.current) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushSnapshot(html);
      }, HISTORY_DEBOUNCE_MS);
    },
    [pushSnapshot],
  );

  React.useEffect(() => {
    if (applyingHistoryRef.current) {
      applyingHistoryRef.current = false;
      fromEditorRef.current = false;
      return;
    }
    if (fromEditorRef.current) {
      fromEditorRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    historyRef.current = [content];
    indexRef.current = 0;
    refreshFlags();
  }, [content, refreshFlags]);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleContentChange = React.useCallback(
    (value: string) => {
      fromEditorRef.current = true;
      onContentChange(value);
      schedulePush(value);
    },
    [onContentChange, schedulePush],
  );

  const videoInsert = useVideoInsert({
    editorRef,
    onEditorHtmlChange: handleContentChange,
    onContentSynced: () => {
      const html = editorRef.current?.innerHTML ?? "";
      handleContentChange(html);
      const selected = editorRef.current?.querySelector(".article-editor-media-selected");
      if (
        selected instanceof HTMLImageElement ||
        selected instanceof HTMLVideoElement ||
        selected instanceof HTMLAudioElement ||
        (selected instanceof HTMLElement && selected.classList.contains("article-embed"))
      ) {
        setPendingSelectMedia(selected);
      }
    },
  });

  const restoreSnapshot = React.useCallback(
    (html: string) => {
      applyingHistoryRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
      onContentChange(html);
      refreshFlags();
    },
    [onContentChange, refreshFlags],
  );

  const undo = React.useCallback(() => {
    if (indexRef.current <= 0) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      // Flush latest editor HTML before stepping back.
      const current = editorRef.current?.innerHTML;
      if (current != null) pushSnapshot(current);
    }
    indexRef.current -= 1;
    restoreSnapshot(historyRef.current[indexRef.current] ?? "");
  }, [pushSnapshot, restoreSnapshot]);

  const redo = React.useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    indexRef.current += 1;
    restoreSnapshot(historyRef.current[indexRef.current] ?? "");
  }, [restoreSnapshot]);

  return (
    <AdminPanel padding="none" className={cn("overflow-hidden shadow-sm", className)}>
      {!hideTitle ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Add title…"
            className="w-full border-0 bg-transparent px-4 pb-2 pt-5 text-2xl font-bold text-admin-heading placeholder:text-admin-trend-muted focus:outline-none sm:px-6 sm:pt-6 sm:text-3xl"
          />
          <InputError message={titleError} className="px-4 sm:px-6" />
        </div>
      ) : null}

      <ArticleRichTextToolbar
        editorRef={editorRef}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onInsertVideo={videoInsert.beginInsertVideo}
        onVideoMediaSelect={videoInsert.handleMediaSelect}
        videoMediaPickerOpen={videoInsert.mediaPickerOpen}
        onVideoMediaPickerOpenChange={videoInsert.setMediaPickerOpen}
        videoDialogs={videoInsert.dialogs}
      />

      <div>
        <ArticleRichTextEditorBody
          editorRef={editorRef}
          content={content}
          onContentChange={handleContentChange}
          onUndo={undo}
          onRedo={redo}
          onRequestVideoReplace={videoInsert.beginReplaceVideo}
          pendingSelectMedia={pendingSelectMedia}
          onPendingSelectHandled={() => setPendingSelectMedia(null)}
          suppressMediaPanel={videoInsert.isVideoUiOpen}
          isReplaceFlowActive={videoInsert.replaceFlowActive}
        />
        <InputError message={contentError} className="px-4 pb-4 sm:px-6" />
      </div>
    </AdminPanel>
  );
}
