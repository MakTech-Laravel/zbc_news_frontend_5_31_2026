import * as React from "react";

import type { ArticleEditorForm } from "@/components/admin/articles/editor/types";
import { EXCERPT_MAX_LENGTH } from "@/components/admin/articles/editor/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent ?? "";
}

function countWords(html: string) {
  const trimmed = stripHtml(html).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

const INITIAL_FORM: ArticleEditorForm = {
  title: "",
  content: "",
  category: "",
  tags: [],
  excerpt: "",
  slug: "",
  scheduledAt: "",
  authorId: "",
  featuredImage: null,
  featuredImagePreview: null,
};

export type UseArticleEditorOptions = {
  initialValues?: Partial<ArticleEditorForm>;
  autoSlugFromTitle?: boolean;
};

export function useArticleEditor(options: UseArticleEditorOptions = {}) {
  const { initialValues, autoSlugFromTitle = true } = options;
  const [form, setForm] = React.useState<ArticleEditorForm>({
    ...INITIAL_FORM,
    ...initialValues,
  });
  const [tagInput, setTagInput] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initialValues?.slug));

  const wordCount = React.useMemo(() => countWords(form.content), [form.content]);
  const charCount = React.useMemo(
    () => stripHtml(form.content).length,
    [form.content],
  );

  const setField = React.useCallback(
    <K extends keyof ArticleEditorForm>(key: K, value: ArticleEditorForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setTitle = React.useCallback(
    (title: string) => {
      setForm((prev) => {
        const next = { ...prev, title };
        if (autoSlugFromTitle && !slugTouched) {
          next.slug = slugify(title);
        }
        return next;
      });
    },
    [autoSlugFromTitle, slugTouched],
  );

  const setSlug = React.useCallback((slug: string) => {
    setSlugTouched(true);
    setField("slug", slug);
  }, [setField]);

  const setExcerpt = React.useCallback(
    (excerpt: string) => {
      setField("excerpt", excerpt.slice(0, EXCERPT_MAX_LENGTH));
    },
    [setField],
  );

  const addTag = React.useCallback(() => {
    const tag = tagInput.trim();
    if (!tag) return;
    setForm((prev) => {
      if (prev.tags.includes(tag)) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    setTagInput("");
  }, [tagInput]);

  const removeTag = React.useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const setFeaturedImage = React.useCallback((file: File | null) => {
    setForm((prev) => {
      if (prev.featuredImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.featuredImagePreview);
      }
      return {
        ...prev,
        featuredImage: file,
        featuredImagePreview: file ? URL.createObjectURL(file) : null,
      };
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (form.featuredImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(form.featuredImagePreview);
      }
    };
  }, [form.featuredImagePreview]);

  const reset = React.useCallback(() => {
    setForm({ ...INITIAL_FORM, ...initialValues });
    setTagInput("");
    setSlugTouched(false);
  }, [initialValues]);

  return {
    form,
    tagInput,
    setTagInput,
    wordCount,
    charCount,
    excerptMaxLength: EXCERPT_MAX_LENGTH,
    setField,
    setTitle,
    setSlug,
    setExcerpt,
    addTag,
    removeTag,
    setFeaturedImage,
    reset,
  };
}

export type UseArticleEditorReturn = ReturnType<typeof useArticleEditor>;
