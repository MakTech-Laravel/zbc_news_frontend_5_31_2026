import * as React from "react";

import { isVideoMedia, type AdminMediaRow } from "@/services/admin/media";

import {
  buildFacebookEmbedHtml,
  buildMediaInsertHtml,
  buildYouTubeEmbedHtml,
  clearVideoReplaceTargetMarker,
  insertVideoHtmlInEditor,
  markVideoReplaceTarget,
  notifyEditorInput,
  resolveVideoReplaceTarget,
  selectMediaElement,
  type EditorMediaElement,
  type VideoEmbedPayload,
} from "./articleEditorMediaUtils";
import { FacebookEmbedDialog } from "./FacebookEmbedDialog";
import { VideoSourcePickerDialog, type VideoSource } from "./VideoSourcePickerDialog";
import { YouTubeEmbedDialog } from "./YouTubeEmbedDialog";

type UseVideoInsertOptions = {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onContentSynced?: () => void;
  onEditorHtmlChange?: (html: string) => void;
};

export function useVideoInsert({
  editorRef,
  onContentSynced,
  onEditorHtmlChange,
}: UseVideoInsertOptions) {
  const replaceTargetIdRef = React.useRef<string | null>(null);
  const advancingFromSourcePickerRef = React.useRef(false);
  const videoCommittedRef = React.useRef(false);
  const savedRangeRef = React.useRef<Range | null>(null);

  const [sourcePickerOpen, setSourcePickerOpen] = React.useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = React.useState(false);
  const [facebookDialogOpen, setFacebookDialogOpen] = React.useState(false);
  const [videoMode, setVideoMode] = React.useState<"insert" | "replace">("insert");
  const [replaceFlowActive, setReplaceFlowActive] = React.useState(false);

  const syncEditorHtml = React.useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onEditorHtmlChange?.(html);
    return html;
  }, [editorRef, onEditorHtmlChange]);

  const saveSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const restoreSelection = React.useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }, [editorRef]);

  const clearReplaceFlow = React.useCallback(() => {
    const editor = editorRef.current;
    if (editor && replaceTargetIdRef.current) {
      clearVideoReplaceTargetMarker(
        resolveVideoReplaceTarget(editor, replaceTargetIdRef.current),
      );
      syncEditorHtml();
    }
    replaceTargetIdRef.current = null;
    setReplaceFlowActive(false);
    setVideoMode("insert");
  }, [editorRef, syncEditorHtml]);

  const commitVideoHtml = React.useCallback(
    (html: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      videoCommittedRef.current = true;

      const replaceTarget = resolveVideoReplaceTarget(editor, replaceTargetIdRef.current);
      const inserted = insertVideoHtmlInEditor(
        editor,
        html,
        replaceTarget,
        replaceTarget ? undefined : restoreSelection,
      );

      replaceTargetIdRef.current = null;
      setReplaceFlowActive(false);
      setVideoMode("insert");

      if (inserted && editor.contains(inserted)) {
        selectMediaElement(inserted, editor);
      }

      notifyEditorInput(editor);
      syncEditorHtml();
      onContentSynced?.();
    },
    [editorRef, onContentSynced, restoreSelection, syncEditorHtml],
  );

  const openVideoSource = React.useCallback(
    (source: VideoSource) => {
      advancingFromSourcePickerRef.current = true;

      if (source === "library") {
        if (!replaceTargetIdRef.current) saveSelection();
        setMediaPickerOpen(true);
        return;
      }
      if (source === "youtube") {
        if (!replaceTargetIdRef.current) saveSelection();
        setYoutubeDialogOpen(true);
        return;
      }
      if (!replaceTargetIdRef.current) saveSelection();
      setFacebookDialogOpen(true);
    },
    [saveSelection],
  );

  const beginInsertVideo = React.useCallback(() => {
    clearReplaceFlow();
    saveSelection();
    setSourcePickerOpen(true);
  }, [clearReplaceFlow, saveSelection]);

  const beginReplaceVideo = React.useCallback(
    (element: EditorMediaElement) => {
      const editor = editorRef.current;
      if (!editor || !editor.contains(element)) return;

      replaceTargetIdRef.current = markVideoReplaceTarget(element);
      setReplaceFlowActive(true);
      setVideoMode("replace");
      syncEditorHtml();
      setSourcePickerOpen(true);
    },
    [editorRef, syncEditorHtml],
  );

  const handleMediaSelect = React.useCallback(
    (item: AdminMediaRow) => {
      if (!isVideoMedia(item)) return;
      const src = item.url || "";
      if (!src) return;
      commitVideoHtml(buildMediaInsertHtml("video", { src }));
    },
    [commitVideoHtml],
  );

  const handleYouTubeInsert = React.useCallback(
    (payload: VideoEmbedPayload) => {
      commitVideoHtml(buildYouTubeEmbedHtml(payload.embedUrl, payload.aspectRatio));
    },
    [commitVideoHtml],
  );

  const handleFacebookInsert = React.useCallback(
    (payload: VideoEmbedPayload) => {
      commitVideoHtml(buildFacebookEmbedHtml(payload.embedUrl, payload.aspectRatio));
    },
    [commitVideoHtml],
  );

  const handleSourcePickerOpenChange = React.useCallback(
    (open: boolean) => {
      setSourcePickerOpen(open);
      if (open) return;

      if (advancingFromSourcePickerRef.current) {
        advancingFromSourcePickerRef.current = false;
        return;
      }

      if (!videoCommittedRef.current) {
        clearReplaceFlow();
      }
    },
    [clearReplaceFlow],
  );

  const handleMediaPickerOpenChange = React.useCallback(
    (open: boolean) => {
      setMediaPickerOpen(open);
      if (!open && !videoCommittedRef.current && replaceFlowActive) {
        clearReplaceFlow();
      }
      if (!open) videoCommittedRef.current = false;
    },
    [clearReplaceFlow, replaceFlowActive],
  );

  const handleYouTubeDialogOpenChange = React.useCallback(
    (open: boolean) => {
      setYoutubeDialogOpen(open);
      if (!open && !videoCommittedRef.current && replaceFlowActive) {
        clearReplaceFlow();
      }
      if (!open) videoCommittedRef.current = false;
    },
    [clearReplaceFlow, replaceFlowActive],
  );

  const handleFacebookDialogOpenChange = React.useCallback(
    (open: boolean) => {
      setFacebookDialogOpen(open);
      if (!open && !videoCommittedRef.current && replaceFlowActive) {
        clearReplaceFlow();
      }
      if (!open) videoCommittedRef.current = false;
    },
    [clearReplaceFlow, replaceFlowActive],
  );

  const dialogs = (
    <>
      <VideoSourcePickerDialog
        open={sourcePickerOpen}
        onOpenChange={handleSourcePickerOpenChange}
        mode={videoMode}
        onSelect={openVideoSource}
      />

      <YouTubeEmbedDialog
        open={youtubeDialogOpen}
        onOpenChange={handleYouTubeDialogOpenChange}
        onInsert={handleYouTubeInsert}
        mode={videoMode}
      />

      <FacebookEmbedDialog
        open={facebookDialogOpen}
        onOpenChange={handleFacebookDialogOpenChange}
        onInsert={handleFacebookInsert}
        mode={videoMode}
      />
    </>
  );

  return {
    beginInsertVideo,
    beginReplaceVideo,
    handleMediaSelect,
    mediaPickerOpen,
    setMediaPickerOpen: handleMediaPickerOpenChange,
    videoMode,
    replaceFlowActive,
    isVideoUiOpen:
      replaceFlowActive ||
      sourcePickerOpen ||
      mediaPickerOpen ||
      youtubeDialogOpen ||
      facebookDialogOpen,
    dialogs,
  };
}
