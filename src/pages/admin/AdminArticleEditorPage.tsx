import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";

import { request } from "@/api/request";
import { ArticleRichTextEditor } from "@/components/admin/articles/ArticleRichTextEditor";
import { ArticleTagInput } from "@/components/admin/articles/ArticleTagInput";
import {
  buildArticleSeoDefaults,
  countWords,
  EXCERPT_MAX_LENGTH,
  META_DESCRIPTION_MAX_LENGTH,
  META_KEYWORDS_MAX_LENGTH,
  META_TITLE_MAX_LENGTH,
  stripHtml,
} from "@/components/admin/articles/articleEditorUtils";
// import { ARTICLE_EDITOR_AUTHORS } from "@/components/admin/articles/editor/types";
import { ArticleEditorTopBar } from "@/components/admin/articles/editor/ArticleEditorTopBar";
import { ArticlePreviewDialog } from "@/components/admin/articles/editor/ArticlePreviewDialog";
import { UnsavedChangesDialog } from "@/components/admin/articles/editor/UnsavedChangesDialog";
import { FeaturedImageUpload } from "@/components/admin/articles/editor/FeaturedImageUpload";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import InputError from "@/components/input-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_WORKFLOW_STATUSES,
  formatArticleLastSaved,
  resolveStatusAfterPublish,
} from "@/data/admin/articleWorkflow";
import {
  ARTICLE_VISIBILITY_LABELS,
  ARTICLE_VISIBILITY_VALUES,
  normalizeArticleVisibility,
  type ArticleVisibility,
} from "@/data/admin/articleVisibility";
import { slugifyCategoryName } from "@/data/admin/categoryStore";
import type { ArticleStatus } from "@/data/admin/mockArticles";
import { isFutureDatetimeLocal, toApiDatetimeValue, toDatetimeLocalValue } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/mediaUrl";

type AdminArticleEditorPageProps = {
  mode: "create" | "edit";
};

type CategoryRow = {
  id: string | number;
  title: string;
  status?: string;
};

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const ARTICLE_STATUS_VALUES = [
  "draft",
  "pending_review",
  "scheduled",
  "published",
  "archived",
] as const;

const articleFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    article_description: z
      .string()
      .refine((value) => stripHtml(value).trim().length > 0, "Article description is required"),
    status: z
      .string()
      .min(1, "Status is required")
      .pipe(z.enum(ARTICLE_STATUS_VALUES)),
    visibility: z
      .string()
      .min(1, "Visibility is required")
      .pipe(z.enum(ARTICLE_VISIBILITY_VALUES)),
    article_category_id: z.string().min(1, "Category is required"),
    tags: z.array(z.string()),
    excerpt: z
      .string()
      .max(EXCERPT_MAX_LENGTH, `Excerpt must be ${EXCERPT_MAX_LENGTH} characters or less`),
    meta_title: z
      .string()
      .max(
        META_TITLE_MAX_LENGTH,
        `Meta title must be ${META_TITLE_MAX_LENGTH} characters or less`,
      ),
    meta_description: z
      .string()
      .max(
        META_DESCRIPTION_MAX_LENGTH,
        `Meta description must be ${META_DESCRIPTION_MAX_LENGTH} characters or less`,
      ),
    meta_keywords: z
      .string()
      .max(
        META_KEYWORDS_MAX_LENGTH,
        `Meta keywords must be ${META_KEYWORDS_MAX_LENGTH} characters or less`,
      ),
    slug: z.string().min(1, "Slug is required"),
    scheduled_publishing: z.string(),
    published_at: z.string(),
    // author_id: z.string().min(1, "Author is required"),
  })
  .superRefine((data, ctx) => {
    if (data.status === "scheduled" && !data.scheduled_publishing.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled publishing date and time are required when status is scheduled",
        path: ["scheduled_publishing"],
      });
      return;
    }

    if (
      data.status === "scheduled" &&
      data.scheduled_publishing.trim() &&
      !isFutureDatetimeLocal(data.scheduled_publishing)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled publishing must be a future date and time",
        path: ["scheduled_publishing"],
      });
    }
  });

type ArticleFormInputValues = z.input<typeof articleFormSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// function getAuthorName(authorId: string) {
//   const match = ARTICLE_EDITOR_AUTHORS.find((author) => author.value === authorId);
//   return match?.label ?? "Unknown author";
// }

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => {
        if (typeof tag === "string") return tag;
        if (tag && typeof tag === "object") {
          const record = tag as Record<string, unknown>;
          if (typeof record.name === "string") return record.name;
          if (typeof record.title === "string") return record.title;
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function resolveCategoryId(raw: Record<string, unknown>): string {
  if (typeof raw.article_category_id === "string" || typeof raw.article_category_id === "number") {
    return String(raw.article_category_id);
  }
  if (typeof raw.category_id === "string" || typeof raw.category_id === "number") {
    return String(raw.category_id);
  }
  if (raw.category && typeof raw.category === "object") {
    const category = raw.category as Record<string, unknown>;
    if (category.id != null) return String(category.id);
  }
  return "";
}

// function resolveAuthorId(raw: Record<string, unknown>): string {
//   if (typeof raw.author_id === "string" || typeof raw.author_id === "number") {
//     return String(raw.author_id);
//   }
//   if (raw.author && typeof raw.author === "object") {
//     const author = raw.author as Record<string, unknown>;
//     if (author.id != null) return String(author.id);
//   }
//   if (raw.user && typeof raw.user === "object") {
//     const user = raw.user as Record<string, unknown>;
//     if (user.id != null) return String(user.id);
//   }
//   return "";
// }

function normalizeArticleStatus(value: unknown): ArticleStatus {
  const status = typeof value === "string" ? value : "";
  if (
    status === "draft" ||
    status === "pending_review" ||
    status === "scheduled" ||
    status === "published" ||
    status === "archived"
  ) {
    return status;
  }
  return "draft";
}

function mapArticleToFormValues(raw: unknown): ArticleFormInputValues {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    title: typeof record.title === "string" ? record.title : "",
    article_description:
      typeof record.article_description === "string"
        ? record.article_description
        : typeof record.content === "string"
          ? record.content
          : typeof record.body === "string"
            ? record.body
            : "",
    status: normalizeArticleStatus(record.status),
    visibility: normalizeArticleVisibility(record.visibility),
    article_category_id: resolveCategoryId(record),
    tags: parseTags(record.tags),
    excerpt: typeof record.excerpt === "string" ? record.excerpt : "",
    meta_title:
      typeof record.seo_title === "string"
        ? record.seo_title
        : typeof record.meta_title === "string"
          ? record.meta_title
          : typeof record.seoTitle === "string"
            ? record.seoTitle
            : "",
    meta_description:
      typeof record.meta_description === "string" ? record.meta_description : "",
    meta_keywords:
      typeof record.meta_keywords === "string" ? record.meta_keywords : "",
    slug: typeof record.slug === "string" ? record.slug : "",
    scheduled_publishing: toDatetimeLocalValue(
      record.scheduled_publishing ?? record.scheduledAt ?? record.publish_at,
    ),
    published_at: toDatetimeLocalValue(record.published_at),
    // author_id: resolveAuthorId(record),
  };
}

function resolveImageUrlFromRecord(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return resolveMediaUrl(value);
    }
  }
  return null;
}

function resolveFeaturedImageUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  return resolveImageUrlFromRecord(raw as Record<string, unknown>, [
    "featured_image",
    "featured_image_url",
    "image",
  ]);
}

function resolveOpenGraphImageUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  return resolveImageUrlFromRecord(raw as Record<string, unknown>, [
    "open_graph_image",
    "open_graph_image_url",
    "og_image",
  ]);
}

function buildArticlePayload(
  data: ArticleFormInputValues,
  status: ArticleStatus,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: data.title,
    article_description: data.article_description,
    slug: data.slug,
    status,
    visibility: data.visibility,
    article_category_id: data.article_category_id,
    excerpt: data.excerpt,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    meta_keywords: data.meta_keywords,
    tags: data.tags,
  };

  if (status === "scheduled" && data.scheduled_publishing.trim()) {
    payload.scheduled_publishing = toApiDatetimeValue(data.scheduled_publishing);
  }

  if (status === "published" && data.published_at.trim()) {
    payload.published_at = toApiDatetimeValue(data.published_at);
  }

  return payload;
}

function appendPayloadToFormData(
  formData: FormData,
  payload: Record<string, unknown>,
) {
  Object.entries(payload).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, String(item));
      });
      return;
    }
    formData.append(key, String(value));
  });
}

const fieldLabelClassName =
  "block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminArticleEditorPage({ mode }: AdminArticleEditorPageProps) {
  const navigate = useNavigate();
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const isEdit = mode === "edit";
  const articleSlugParam = articleSlug ? decodeURIComponent(articleSlug) : undefined;

  // ── State ──────────────────────────────────────────────────────────────────

  const [loading, setLoading] = React.useState(isEdit);
  const [notFound, setNotFound] = React.useState(false);
  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = React.useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = React.useState<string | null>(
    null,
  );
  const [openGraphImageFile, setOpenGraphImageFile] = React.useState<File | null>(null);
  const [openGraphImagePreview, setOpenGraphImagePreview] = React.useState<string | null>(
    null,
  );
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const pendingLeaveRef = React.useRef<(() => void) | null>(null);
  const submitActionRef = React.useRef<"draft" | "publish" | "selected">("selected");
  const skipUnsavedPromptRef = React.useRef(false);

  // ── React Hook Form ────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ArticleFormInputValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      article_description: "",
      status: "",
      visibility: "public",
      article_category_id: "",
      tags: [],
      excerpt: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      slug: "",
      scheduled_publishing: "",
      published_at: "",
      // author_id: "",
    },
  });

  const titleValue = watch("title");
  const watchedContent = watch("article_description");
  const watchedStatus = watch("status");
  const watchedValues = watch();

  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugifyCategoryName(titleValue ?? ""));
    }
  }, [titleValue, slugTouched, setValue]);

  // ── API: GET — categories load ─────────────────────────────────────────────

  const fetchCategories = async () => {
    try {
      const response = await request.get("/categories");
      setCategories(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    }
  };

  React.useEffect(() => {
    void fetchCategories();
  }, []);

  // ── API: GET — article load (edit) ───────────────────────────────────────

  const fetchArticle = async () => {
    if (!isEdit || !articleSlugParam) return;

    try {
      setLoading(true);
      const response = await request.get(`/admin/articles/show/${articleSlugParam}`);
      const article = response.data.data;

      if (!article) {
        setNotFound(true);
        return;
      }

      reset(mapArticleToFormValues(article));
      setSlugTouched(true);
      setFeaturedImagePreview(resolveFeaturedImageUrl(article));
      setFeaturedImageFile(null);
      setOpenGraphImagePreview(resolveOpenGraphImageUrl(article));
      setOpenGraphImageFile(null);
      skipUnsavedPromptRef.current = false;
    } catch (error) {
      console.error("Failed to fetch article:", error);
      toast.error("Failed to load article");
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void fetchArticle();
  }, [articleSlugParam, isEdit]);

  React.useEffect(() => {
    return () => {
      if (featuredImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(featuredImagePreview);
      }
      if (openGraphImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(openGraphImagePreview);
      }
    };
  }, [featuredImagePreview, openGraphImagePreview]);

  const wordCount = React.useMemo(
    () => countWords(watchedContent ?? ""),
    [watchedContent],
  );
  const charCount = React.useMemo(
    () => stripHtml(watchedContent ?? "").length,
    [watchedContent],
  );

  const applySeoFromArticle = React.useCallback(() => {
    const values = getValues();
    const categoryTitle =
      categories.find((category) => String(category.id) === values.article_category_id)
        ?.title ?? "";
    const seoDefaults = buildArticleSeoDefaults({
      title: values.title,
      excerpt: values.excerpt,
      articleDescription: values.article_description,
      tags: values.tags,
      categoryTitle,
    });
    setValue("meta_title", seoDefaults.meta_title, { shouldDirty: true });
    setValue("meta_description", seoDefaults.meta_description, { shouldDirty: true });
    setValue("meta_keywords", seoDefaults.meta_keywords, { shouldDirty: true });
  }, [categories, getValues, setValue]);

  // ── API: POST — form submit ────────────────────────────────────────────────

  const onSubmit = async (data: ArticleFormInputValues) => {
    const nextStatus =
      submitActionRef.current === "publish"
        ? resolveStatusAfterPublish(data.scheduled_publishing)
        : (data.status as ArticleStatus);

    const categoryTitle =
      categories.find((category) => String(category.id) === data.article_category_id)
        ?.title ?? "";

    const seoDefaults = buildArticleSeoDefaults({
      title: data.title,
      excerpt: data.excerpt,
      articleDescription: data.article_description,
      tags: data.tags,
      categoryTitle,
    });

    const enriched: ArticleFormInputValues = {
      ...data,
      meta_title: data.meta_title.trim() || seoDefaults.meta_title,
      meta_description: data.meta_description.trim() || seoDefaults.meta_description,
      meta_keywords: data.meta_keywords.trim() || seoDefaults.meta_keywords,
    };

    const payload = buildArticlePayload(enriched, nextStatus);

    try {
      const hasImageUpload = Boolean(featuredImageFile || openGraphImageFile);

      if (hasImageUpload) {
        const formData = new FormData();
        appendPayloadToFormData(formData, payload);
        if (featuredImageFile) {
          formData.append("featured_image", featuredImageFile);
        }
        if (openGraphImageFile) {
          formData.append("open_graph_image", openGraphImageFile);
        }

        if (isEdit && articleSlugParam) {
          await request.post(`/admin/articles/update/${articleSlugParam}`, formData);
          toast.success("Article updated successfully");
        } else {
          await request.post("/admin/articles/store", formData);
          toast.success("Article created successfully");
        }
      } else if (isEdit && articleSlugParam) {
        await request.post(`/admin/articles/update/${articleSlugParam}`, payload);
        toast.success("Article updated successfully");
      } else {
        await request.post("/admin/articles/store", payload);
        toast.success("Article created successfully");
      }

      setLastSavedAt(new Date().toISOString());
      reset({ ...enriched, status: nextStatus }, { keepDirty: false });
      setFeaturedImageFile(null);
      setOpenGraphImageFile(null);
      skipUnsavedPromptRef.current = true;
      setShowLeaveDialog(false);
      pendingLeaveRef.current = null;
      navigate("/admin/articles");
    } catch (error) {
      console.error("Failed to save article:", error);
      toast.error("Failed to save article");
      console.log("DATA:", (error as { response?: { data?: unknown } }).response?.data);
    }
  };

  const submitWithStatus = (status: ArticleStatus, action: "draft" | "publish") => {
    submitActionRef.current = action;
    setValue("status", status);
    void handleSubmit(onSubmit)();
  };

  const saveWithSelectedStatus = () => {
    const status = getValues("status");
    if (
      !status ||
      !ARTICLE_STATUS_VALUES.includes(status as (typeof ARTICLE_STATUS_VALUES)[number])
    ) {
      toast.error("Please select a workflow status");
      return;
    }

    submitActionRef.current = "selected";
    void handleSubmit(onSubmit)();
  };

  const handleFeaturedImageSelect = (file: File | null) => {
    setFeaturedImageFile(file);
    setFeaturedImagePreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleOpenGraphImageSelect = (file: File | null) => {
    setOpenGraphImageFile(file);
    setOpenGraphImagePreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !skipUnsavedPromptRef.current &&
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      setShowLeaveDialog(true);
    }
  }, [blocker.state]);

  const requestLeave = (action: () => void) => {
    if (!isDirty || skipUnsavedPromptRef.current) {
      action();
      return;
    }
    pendingLeaveRef.current = action;
    setShowLeaveDialog(true);
  };

  const confirmLeave = () => {
    setShowLeaveDialog(false);
    const pending = pendingLeaveRef.current;
    pendingLeaveRef.current = null;

    if (blocker.state === "blocked") {
      blocker.proceed?.();
      return;
    }
    pending?.();
  };

  const cancelLeave = () => {
    setShowLeaveDialog(false);
    pendingLeaveRef.current = null;
    if (blocker.state === "blocked") {
      blocker.reset?.();
    }
  };

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  if (isEdit && !articleSlugParam) {
    return <Navigate to="/admin/articles" replace />;
  }

  if (isEdit && notFound) {
    return <Navigate to="/admin/articles" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const previewPublishSource =
    watchedStatus === "scheduled"
      ? watchedValues.scheduled_publishing
      : watchedStatus === "published"
        ? watchedValues.published_at
        : "";

  const previewData = {
    title: watchedValues.title ?? "",
    article_description: watchedValues.article_description ?? "",
    excerpt: watchedValues.excerpt ?? "",
    category:
      categories.find((category) => String(category.id) === watchedValues.article_category_id)
        ?.title ??
      "",
    tags: watchedValues.tags ?? [],
    authorName: "",
    featuredImageUrl: featuredImagePreview,
    status: (watchedStatus || "draft") as ArticleStatus,
    publishDisplayAt: previewPublishSource
      ? toApiDatetimeValue(previewPublishSource) || previewPublishSource
      : undefined,
  };

  const displayStatus: ArticleStatus | "" =
    watchedStatus &&
    ARTICLE_STATUS_VALUES.includes(watchedStatus as (typeof ARTICLE_STATUS_VALUES)[number])
      ? (watchedStatus as ArticleStatus)
      : "";

  return (
    <div className="-mx-4 flex flex-col overflow-x-hidden sm:-mx-6">
      <ArticleEditorTopBar
        wordCount={wordCount}
        charCount={charCount}
        status={displayStatus}
        lastSavedLabel={formatArticleLastSaved(lastSavedAt)}
        isDirty={isDirty}
        isAutoSaving={isSubmitting}
        onBack={() => requestLeave(() => navigate("/admin/articles"))}
        onPreview={() => setIsPreviewOpen(true)}
        onSave={saveWithSelectedStatus}
        onSaveDraft={() => submitWithStatus("draft", "draft")}
        onPublish={() => submitWithStatus("published", "publish")}
      />

      <form
        className="px-4 py-5 sm:px-6 sm:py-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="container mx-auto flex w-full flex-col gap-6 lg:flex-row lg:items-start">
          <Controller
            name="title"
            control={control}
            render={({ field: titleField }) => (
              <Controller
                name="article_description"
                control={control}
                render={({ field: contentField }) => (
                  <ArticleRichTextEditor
                    className="min-w-0 flex-1"
                    title={titleField.value}
                    onTitleChange={titleField.onChange}
                    titleError={errors.title?.message}
                    content={contentField.value}
                    onContentChange={contentField.onChange}
                    contentError={errors.article_description?.message}
                  />
                )}
              />
            )}
          />

          <AdminPanel className="h-fit w-full shrink-0 shadow-sm lg:sticky lg:top-16 lg:w-[320px] lg:self-start xl:w-[340px]">
            <h2 className="mb-4 text-lg font-semibold text-admin-heading">
              Article Settings
            </h2>

            <div className="flex flex-col gap-5">
              <div className="space-y-1">
                <label className={fieldLabelClassName}>Workflow status</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value as ArticleStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ARTICLE_WORKFLOW_STATUSES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {ARTICLE_STATUS_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputError message={errors.status?.message} />
              </div>

              <div className="space-y-1">
                <label className={fieldLabelClassName}>Visibility</label>
                <Controller
                  name="visibility"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value as ArticleVisibility)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {ARTICLE_VISIBILITY_VALUES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {ARTICLE_VISIBILITY_LABELS[value]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputError message={errors.visibility?.message} />
              </div>

              {watchedStatus === "scheduled" ? (
                <div className="space-y-1">
                  <label htmlFor="article-schedule" className={fieldLabelClassName}>
                    Scheduled publishing date &amp; time
                  </label>
                  <Input
                    id="article-schedule"
                    type="datetime-local"
                    step={60}
                    {...register("scheduled_publishing")}
                  />
                  <p className="text-xs text-admin-label">
                    The article will go live automatically at this date and time.
                  </p>
                  <InputError message={errors.scheduled_publishing?.message} />
                </div>
              ) : null}

              {watchedStatus === "published" ? (
                <div className="space-y-1">
                  <label htmlFor="article-published-at" className={fieldLabelClassName}>
                    Published date &amp; time
                  </label>
                  <Input
                    id="article-published-at"
                    type="datetime-local"
                    step={60}
                    {...register("published_at")}
                  />
                  <p className="text-xs text-admin-label">
                    Shown to readers on the article page. Leave blank to use the current time when
                    first published.
                  </p>
                  <InputError message={errors.published_at?.message} />
                </div>
              ) : null}

              {/* {watchedStatus !== "archived" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => submitWithStatus("archived")}
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-[10px] border-admin-input-border text-sm text-admin-heading"
                >
                  Archive article
                </Button>
              ) : null} */}

              <div className="space-y-1">
                <label className={fieldLabelClassName}>Featured Image</label>
                <FeaturedImageUpload
                  previewUrl={featuredImagePreview}
                  onFileSelect={handleFeaturedImageSelect}
                />
              </div>

              <div className="space-y-1">
                <label className={fieldLabelClassName}>Category</label>
                <Controller
                  name="article_category_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((category) => category.status === "active")
                          .map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputError message={errors.article_category_id?.message} />
              </div>

              <div className="space-y-1">
                <label className={fieldLabelClassName}>Tags</label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <ArticleTagInput
                      tags={field.value}
                      onChange={field.onChange}
                      error={errors.tags?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className={fieldLabelClassName}>Excerpt</label>
                <textarea
                  {...register("excerpt")}
                  rows={4}
                  maxLength={EXCERPT_MAX_LENGTH}
                  placeholder="Brief summary for listings and SEO…"
                  className={cn(
                    "flex min-h-[96px] w-full resize-none rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-zbc-blue-200/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zbc-blue-200/50 md:text-sm",
                  )}
                />
                <p className="text-xs text-admin-trend-muted">
                  {(watchedValues.excerpt ?? "").length}/{EXCERPT_MAX_LENGTH} characters
                </p>
                <InputError message={errors.excerpt?.message} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="article-seo-title" className={fieldLabelClassName}>
                    Meta Title
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={applySeoFromArticle}
                  >
                    Generate from article
                  </Button>
                </div>
                <Input
                  id="article-meta-title"
                  placeholder="Leave empty to auto-fill from title on save"
                  maxLength={META_TITLE_MAX_LENGTH}
                  {...register("meta_title")}
                />
                <p className="text-xs text-admin-trend-muted">
                  {(watchedValues.meta_title ?? "").length}/{META_TITLE_MAX_LENGTH} characters
                </p>
                <InputError message={errors.meta_title?.message} />
              </div>

              <div className="space-y-1">
                <label htmlFor="article-meta-description" className={fieldLabelClassName}>
                  Meta Description
                </label>
                <textarea
                  id="article-meta-description"
                  {...register("meta_description")}
                  rows={4}
                  maxLength={META_DESCRIPTION_MAX_LENGTH}
                  placeholder="Description for search engines and social sharing…"
                  className={cn(
                    "flex min-h-[96px] w-full resize-none rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-zbc-blue-200/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zbc-blue-200/50 md:text-sm",
                  )}
                />
                <p className="text-xs text-admin-trend-muted">
                  {(watchedValues.meta_description ?? "").length}/{META_DESCRIPTION_MAX_LENGTH}{" "}
                  characters
                </p>
                <InputError message={errors.meta_description?.message} />
              </div>

              <div className="space-y-1">
                <label htmlFor="article-meta-keywords" className={fieldLabelClassName}>
                  Meta Keywords
                </label>
                <textarea
                  id="article-meta-keywords"
                  {...register("meta_keywords")}
                  rows={3}
                  maxLength={META_KEYWORDS_MAX_LENGTH}
                  placeholder="Comma-separated keywords (auto-filled from tags if empty)"
                  className={cn(
                    "flex min-h-[72px] w-full resize-none rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-zbc-blue-200/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zbc-blue-200/50 md:text-sm",
                  )}
                />
                <p className="text-xs text-admin-trend-muted">
                  {(watchedValues.meta_keywords ?? "").length}/{META_KEYWORDS_MAX_LENGTH}{" "}
                  characters
                </p>
                <InputError message={errors.meta_keywords?.message} />
              </div>

              <div className="space-y-1">
                <label className={fieldLabelClassName}>Open Graph Image</label>
                <FeaturedImageUpload
                  previewUrl={openGraphImagePreview}
                  onFileSelect={handleOpenGraphImageSelect}
                  uploadLabel="Upload Open Graph image"
                  previewAlt="Open Graph preview"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="article-slug" className={fieldLabelClassName}>
                  URL Slug
                </label>
                <Input
                  id="article-slug"
                  placeholder="article-url-slug"
                  {...register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                />
                <InputError message={errors.slug?.message} />
              </div>


              {/* <div className="space-y-1">
                <label className={fieldLabelClassName}>Author</label>
                <Controller
                  name="author_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {ARTICLE_EDITOR_AUTHORS.filter((author) => author.value).map(
                          (author) => (
                            <SelectItem key={author.value} value={author.value}>
                              {author.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputError message={errors.author_id?.message} />
              </div> */}
            </div>
          </AdminPanel>
        </div>
      </form>

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onStay={cancelLeave}
        onLeave={confirmLeave}
      />

      <ArticlePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        preview={previewData}
      />
    </div>
  );
}
