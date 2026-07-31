import axios from "axios";
import * as React from "react";

import { autoSaveAdminArticle, type ArticleAutoSaveResult } from "@/services/admin/articles";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

const AUTO_SAVE_DEBOUNCE_MS = 2500;
const SAVED_INDICATOR_MS = 3000;

export type UseArticleAutoSaveOptions = {
  enabled: boolean;
  initialSlug?: string;
  isDirty: boolean;
  isManualSaving: boolean;
  changeSignature: string;
  getPayload: () => Record<string, unknown> | null;
  onSaved: (result: ArticleAutoSaveResult) => void;
  /** Override default `/admin/articles/auto-save` (e.g. live-updates). */
  saveFn?: (
    payload: Record<string, unknown>,
    slug: string | undefined,
    signal: AbortSignal,
  ) => Promise<ArticleAutoSaveResult>;
};

export function useArticleAutoSave({
  enabled,
  initialSlug,
  isDirty,
  isManualSaving,
  changeSignature,
  getPayload,
  onSaved,
  saveFn,
}: UseArticleAutoSaveOptions) {
  const [autoSaveStatus, setAutoSaveStatus] = React.useState<AutoSaveStatus>("idle");
  const persistedSlugRef = React.useRef<string | undefined>(initialSlug);
  const savedSnapshotRef = React.useRef("");
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const requestIdRef = React.useRef(0);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const getPayloadRef = React.useRef(getPayload);
  const onSavedRef = React.useRef(onSaved);
  const saveFnRef = React.useRef(saveFn);

  getPayloadRef.current = getPayload;
  onSavedRef.current = onSaved;
  saveFnRef.current = saveFn;

  React.useEffect(() => {
    if (initialSlug) {
      persistedSlugRef.current = initialSlug;
    }
  }, [initialSlug]);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (savedIndicatorTimerRef.current) clearTimeout(savedIndicatorTimerRef.current);
    };
  }, []);

  const performAutoSave = React.useCallback(async () => {
    if (!enabled || isManualSaving || !isDirty) return;

    const payload = getPayloadRef.current();
    if (!payload) return;

    const snapshot = JSON.stringify(payload);
    if (snapshot === savedSnapshotRef.current) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    setAutoSaveStatus("saving");

    try {
      const persist = saveFnRef.current ?? autoSaveAdminArticle;
      const result = await persist(
        payload,
        persistedSlugRef.current,
        controller.signal,
      );

      if (requestId !== requestIdRef.current) return;

      persistedSlugRef.current = result.slug;
      savedSnapshotRef.current = snapshot;
      onSavedRef.current(result);
      setAutoSaveStatus("saved");

      if (savedIndicatorTimerRef.current) {
        clearTimeout(savedIndicatorTimerRef.current);
      }
      savedIndicatorTimerRef.current = setTimeout(() => {
        if (requestId === requestIdRef.current) {
          setAutoSaveStatus("idle");
        }
      }, SAVED_INDICATOR_MS);
    } catch (error) {
      if (
        axios.isCancel(error) ||
        (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
      ) {
        return;
      }
      if (requestId !== requestIdRef.current) return;
      console.error("Article auto-save failed:", error);
      setAutoSaveStatus("error");
    }
  }, [enabled, isDirty, isManualSaving]);

  React.useEffect(() => {
    if (!enabled || !isDirty || isManualSaving) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void performAutoSave();
    }, AUTO_SAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [enabled, isDirty, isManualSaving, changeSignature, performAutoSave]);

  const resetAutoSaveSnapshot = React.useCallback((payload?: Record<string, unknown>) => {
    savedSnapshotRef.current = payload ? JSON.stringify(payload) : "";
    setAutoSaveStatus("idle");
  }, []);

  const getPersistedSlug = React.useCallback(() => persistedSlugRef.current, []);

  const setPersistedSlug = React.useCallback((slug: string) => {
    persistedSlugRef.current = slug;
  }, []);

  return {
    autoSaveStatus,
    getPersistedSlug,
    setPersistedSlug,
    resetAutoSaveSnapshot,
  };
}
