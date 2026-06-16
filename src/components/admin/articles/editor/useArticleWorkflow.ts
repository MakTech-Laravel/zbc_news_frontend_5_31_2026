import * as React from "react";
import { useBlocker } from "react-router-dom";

import type { ArticleEditorForm } from "@/components/admin/articles/editor/types";
import {
  useArticleEditor,
  type UseArticleEditorOptions,
} from "@/components/admin/articles/editor/useArticleEditor";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import {
  formatArticleLastSaved,
  resolveStatusAfterPublish,
} from "@/data/admin/articleWorkflow";
import {
  createNewArticleId,
  getAdminArticleById,
  loadArticleDraft,
  markArticleUnsaved,
  persistArticleWorkflow,
} from "@/data/admin/articleDummyStore";
import type { ArticleStatus } from "@/data/admin/mockArticles";

const AUTO_SAVE_MS = 20_000;

function serializeForCompare(form: ArticleEditorForm) {
  return JSON.stringify({
    title: form.title,
    content: form.content,
    category: form.category,
    tags: form.tags,
    excerpt: form.excerpt,
    slug: form.slug,
    scheduledAt: form.scheduledAt,
    authorId: form.authorId,
  });
}

export type UseArticleWorkflowOptions = UseArticleEditorOptions & {
  articleId?: string;
  initialStatus?: ArticleStatus;
};

export function useArticleWorkflow(options: UseArticleWorkflowOptions = {}) {
  const { articleId: initialArticleId, initialStatus = "draft", ...editorOptions } =
    options;
  const { settings } = useSiteSettings();

  const [articleId] = React.useState(
    () => initialArticleId ?? createNewArticleId(),
  );
  const [status, setStatus] = React.useState<ArticleStatus>(initialStatus);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = React.useState("");
  const [savedStatus, setSavedStatus] = React.useState<ArticleStatus>(initialStatus);
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const pendingLeaveRef = React.useRef<(() => void) | null>(null);
  const initializedRef = React.useRef(false);

  const editor = useArticleEditor(editorOptions);
  const existingArticle = React.useMemo(
    () => (initialArticleId ? getAdminArticleById(initialArticleId) : undefined),
    [initialArticleId],
  );

  React.useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (initialArticleId) {
      const stored = loadArticleDraft(initialArticleId);
      if (stored) {
        setStatus(stored.status);
        setLastSavedAt(stored.lastSavedAt);
        setSavedSnapshot(serializeForCompare(stored.form));
        setSavedStatus(stored.status);
        return;
      }
      if (existingArticle) {
        setStatus(existingArticle.status);
        setSavedStatus(existingArticle.status);
        setLastSavedAt(existingArticle.lastSavedAt ?? null);
      }
    }

    setSavedSnapshot(serializeForCompare(editor.form));
    setSavedStatus(initialStatus);
  }, [initialArticleId, existingArticle, editor.form, initialStatus]);

  const isDirty =
    savedSnapshot !== serializeForCompare(editor.form) || savedStatus !== status;
  const lastSavedLabel = formatArticleLastSaved(lastSavedAt);

  const persist = React.useCallback(
    (nextStatus: ArticleStatus, saveOptions?: { auto?: boolean }) => {
      const result = persistArticleWorkflow(
        articleId,
        editor.form,
        nextStatus,
        existingArticle,
        saveOptions,
      );

      setStatus(result.status);
      setLastSavedAt(result.article.lastSavedAt ?? new Date().toISOString());
      setSavedSnapshot(serializeForCompare(editor.form));
      setSavedStatus(result.status);
      markArticleUnsaved(articleId, false);

      return result;
    },
    [articleId, editor.form, existingArticle, initialArticleId],
  );

  const saveDraft = React.useCallback(() => {
    persist("draft");
  }, [persist]);

  const submitForReview = React.useCallback(() => {
    persist("pending_review");
  }, [persist]);

  const publish = React.useCallback(() => {
    const next = resolveStatusAfterPublish(editor.form.scheduledAt);
    persist(next);
  }, [editor.form.scheduledAt, persist]);

  const archive = React.useCallback(() => {
    persist("archived");
  }, [persist]);

  const runAutoSave = React.useCallback(() => {
    if (!isDirty) return;
    setIsAutoSaving(true);
    persist(status === "draft" ? "draft" : status, { auto: true });
    window.setTimeout(() => setIsAutoSaving(false), 600);
  }, [isDirty, persist, status]);

  React.useEffect(() => {
    if (!isDirty) {
      markArticleUnsaved(articleId, false);
      return;
    }
    markArticleUnsaved(articleId, true);
  }, [articleId, isDirty]);

  React.useEffect(() => {
    if (!settings.enableAutoSave) return;
    const interval = window.setInterval(runAutoSave, AUTO_SAVE_MS);
    return () => window.clearInterval(interval);
  }, [runAutoSave, settings.enableAutoSave]);

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      setShowLeaveDialog(true);
    }
  }, [blocker.state]);

  const requestLeave = React.useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      pendingLeaveRef.current = action;
      setShowLeaveDialog(true);
    },
    [isDirty],
  );

  const confirmLeave = React.useCallback(() => {
    setShowLeaveDialog(false);
    const pending = pendingLeaveRef.current;
    pendingLeaveRef.current = null;

    if (blocker.state === "blocked") {
      blocker.proceed?.();
      return;
    }
    pending?.();
  }, [blocker]);

  const cancelLeave = React.useCallback(() => {
    setShowLeaveDialog(false);
    pendingLeaveRef.current = null;
    if (blocker.state === "blocked") {
      blocker.reset?.();
    }
  }, [blocker]);

  return {
    ...editor,
    articleId,
    status,
    setStatus,
    lastSavedAt,
    lastSavedLabel,
    isDirty,
    isAutoSaving,
    saveDraft,
    submitForReview,
    publish,
    archive,
    showLeaveDialog,
    confirmLeave,
    cancelLeave,
    requestLeave,
  };
}

export type UseArticleWorkflowReturn = ReturnType<typeof useArticleWorkflow>;
