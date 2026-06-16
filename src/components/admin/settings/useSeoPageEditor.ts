import * as React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  fetchAdminSeoPage,
  updateAdminSeoPage,
} from "@/services/admin/seoPages";
import type { SeoPage } from "@/types/siteSettings";

export function useSeoPageEditor(pageKey: string | undefined) {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState<SeoPage | undefined>();
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [metaKeywords, setMetaKeywords] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!pageKey) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchAdminSeoPage(pageKey)
      .then((result) => {
        if (cancelled || !result) return;
        setPage(result);
        setMetaTitle(result.metaTitle);
        setMetaDescription(result.metaDescription);
        setMetaKeywords(result.metaKeywords);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load SEO page");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageKey]);

  const save = React.useCallback(async () => {
    if (!pageKey) return false;

    setSaving(true);
    try {
      const updated = await updateAdminSeoPage(pageKey, {
        metaTitle,
        metaDescription,
        metaKeywords,
      });
      setPage(updated);
      await queryClient.invalidateQueries({ queryKey: ["public-seo-pages"] });
      toast.success("SEO page saved successfully");
      return true;
    } catch {
      toast.error("Failed to save SEO page");
      return false;
    } finally {
      setSaving(false);
    }
  }, [pageKey, metaTitle, metaDescription, metaKeywords, queryClient]);

  return {
    page,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    metaKeywords,
    setMetaKeywords,
    save,
    loading,
    saving,
  };
}
