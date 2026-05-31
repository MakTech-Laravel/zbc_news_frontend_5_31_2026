import * as React from "react";

import { getSeoPage, updateSeoPage } from "@/data/admin/mockSeoPages";

export function useSeoPageEditor(pageId: string | undefined) {
  const page = pageId ? getSeoPage(pageId) : undefined;

  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [metaKeywords, setMetaKeywords] = React.useState("");

  React.useEffect(() => {
    if (!page) return;
    setMetaTitle(page.metaTitle);
    setMetaDescription(page.metaDescription);
    setMetaKeywords(page.metaKeywords);
  }, [page]);

  const save = React.useCallback(() => {
    if (!pageId) return;
    updateSeoPage(pageId, {
      metaTitle,
      metaDescription,
      metaKeywords,
    });
  }, [pageId, metaTitle, metaDescription, metaKeywords]);

  return {
    page,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    metaKeywords,
    setMetaKeywords,
    save,
  };
}
