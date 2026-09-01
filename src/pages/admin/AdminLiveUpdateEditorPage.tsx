import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { ArticleEditorTopBar } from "@/components/admin/articles/editor/ArticleEditorTopBar";
import { ArticlePreviewDialog } from "@/components/admin/articles/editor/ArticlePreviewDialog";
import {
  emptyFeaturedMediaValue,
  FeaturedMediaField,
  liveFeaturedVideoNeedsPoster,
  resolveFeaturedYouTubeEmbedUrl,
  type FeaturedMediaValue,
} from "@/components/admin/media/FeaturedMediaField";
import { MediaImageField } from "@/components/admin/media/MediaImageField";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import {
  CategorySearchSelect,
  flattenCategoryOptions,
  type CategorySearchOption,
} from "@/components/admin/shared/CategorySearchSelect";
import InputError from "@/components/input-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_WORKFLOW_STATUSES,
  formatArticleLastSaved,
  resolveStatusAfterPublish,
} from "@/data/admin/articleWorkflow";
import {
  ARTICLE_VISIBILITY_LABELS,
  ARTICLE_VISIBILITY_VALUES,
} from "@/data/admin/articleVisibility";
import { slugifyCategoryName } from "@/data/admin/categoryStore";
import type { ArticleStatus } from "@/data/admin/mockArticles";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { getAuthErrorMessage, getAuthFieldErrors } from "@/features/auth/errorMessage";
import { useArticleAutoSave } from "@/hooks/useArticleAutoSave";
import { toApiDatetimeValue, toDatetimeLocalValue } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { ArticleAutoSaveResult } from "@/services/admin/articles";
import { autoSaveAdminArticle } from "@/services/admin/articles";
import {
  createLiveUpdate,
  createLiveUpdateEntry,
  deleteLiveUpdateEntry,
  endLiveUpdateCoverage,
  fetchLiveUpdateBySlug,
  startLiveUpdateCoverage,
  updateLiveUpdate,
  updateLiveUpdateEntry,
  type LiveUpdateEntry,
  type LiveUpdateEntryStatus,
  type LiveUpdateShell,
} from "@/services/admin/liveUpdates";

type Mode = "create" | "edit";

type CategoryRow = {
  id: string | number;
  title: string;
  status?: string;
  parent_title?: string;
};

const ARTICLE_STATUS_VALUES = [
  "draft",
  "pending_review",
  "scheduled",
  "published",
  "archived",
] as const;

const shellSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    article_description: z.string(),
    status: z.enum(ARTICLE_STATUS_VALUES),
    visibility: z.enum(ARTICLE_VISIBILITY_VALUES),
    article_category_id: z.string().min(1, "Category is required"),
    tags: z.array(z.string()),
    excerpt: z.string().max(EXCERPT_MAX_LENGTH),
    meta_title: z.string().max(META_TITLE_MAX_LENGTH),
    meta_description: z.string().max(META_DESCRIPTION_MAX_LENGTH),
    meta_keywords: z.string().max(META_KEYWORDS_MAX_LENGTH),
    slug: z.string().min(1, "Slug is required"),
    scheduled_publishing: z.string(),
    published_at: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "scheduled" && !data.scheduled_publishing.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled publishing date and time are required when status is scheduled",
        path: ["scheduled_publishing"],
      });
    }
  });

type ShellFormValues = z.infer<typeof shellSchema>;

const SHELL_FORM_FIELDS: (keyof ShellFormValues)[] = [
  "title",
  "article_description",
  "status",
  "visibility",
  "article_category_id",
  "tags",
  "excerpt",
  "meta_title",
  "meta_description",
  "meta_keywords",
  "slug",
  "scheduled_publishing",
  "published_at",
];

const fieldLabelClassName =
  "block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm";

function featuredImageUrlFromMedia(media: FeaturedMediaValue): string | null {
  if (media.type === "image") return media.url;
  return media.posterUrl || media.thumbnailUrl || null;
}

function normalizeEditorSlug(slug: unknown): string | null {
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  if (!trimmed || trimmed === "[object Object]") return null;
  return trimmed;
}

function appendMediaToPayload(
  payload: Record<string, unknown>,
  featuredMedia: FeaturedMediaValue,
  openGraphImageUrl: string | null,
) {
  const embedUrl = resolveFeaturedYouTubeEmbedUrl(featuredMedia.url);
  const liveVideoUrl =
    featuredMedia.type === "video" && embedUrl.includes("youtube.com/embed/")
      ? embedUrl
      : "";

  payload.featured_image = featuredImageUrlFromMedia(featuredMedia) ?? "";
  payload.open_graph_image = openGraphImageUrl ?? "";
  payload.live_video_url = liveVideoUrl;

  if (liveVideoUrl) {
    payload.featured_media_uuid = "";
    payload.poster_media_uuid = featuredMedia.posterUuid ?? "";
  } else if (featuredMedia.mediaUuid) {
    payload.featured_media_uuid = featuredMedia.mediaUuid;
    payload.poster_media_uuid =
      featuredMedia.type === "image" ? "" : (featuredMedia.posterUuid ?? "");
  } else if (!featuredMedia.url && !featuredImageUrlFromMedia(featuredMedia)) {
    payload.featured_media_uuid = "";
    payload.poster_media_uuid = "";
  }
}

function buildShellPayload(
  data: ShellFormValues,
  status: ArticleStatus,
  featuredMedia: FeaturedMediaValue,
  openGraphImageUrl: string | null,
  categories: CategoryRow[],
): Record<string, unknown> {
  const categoryTitle =
    categories.find((c) => String(c.id) === data.article_category_id)?.title ?? "";
  const seoDefaults = buildArticleSeoDefaults({
    title: data.title,
    excerpt: data.excerpt,
    articleDescription: data.article_description,
    tags: data.tags,
    categoryTitle,
  });

  const payload: Record<string, unknown> = {
    title: data.title,
    article_description: data.article_description || "",
    slug: data.slug,
    status,
    visibility: data.visibility,
    is_live_blog: true,
    article_category_id: data.article_category_id,
    excerpt: data.excerpt,
    meta_title: data.meta_title.trim() || seoDefaults.meta_title,
    meta_description: data.meta_description.trim() || seoDefaults.meta_description,
    meta_keywords: data.meta_keywords.trim() || seoDefaults.meta_keywords,
    tags: data.tags,
  };

  if (status === "scheduled" && data.scheduled_publishing.trim()) {
    payload.scheduled_publishing = toApiDatetimeValue(data.scheduled_publishing);
  }
  if (status === "published") {
    if (data.published_at.trim()) {
      payload.published_at = toApiDatetimeValue(data.published_at);
    } else if (data.scheduled_publishing.trim()) {
      const scheduledUtc = toApiDatetimeValue(data.scheduled_publishing);
      payload.published_at = scheduledUtc;
      payload.scheduled_publishing = scheduledUtc;
    }
  }

  appendMediaToPayload(payload, featuredMedia, openGraphImageUrl);
  return payload;
}

function buildLiveAutoSavePayload(
  data: ShellFormValues,
  featuredMedia: FeaturedMediaValue,
  openGraphImageUrl: string | null,
  categories: CategoryRow[],
): Record<string, unknown> | null {
  const title = data.title.trim();
  const content = stripHtml(data.article_description ?? "").trim();
  const featuredImageUrl = featuredImageUrlFromMedia(featuredMedia);

  if (
    !title &&
    !content &&
    !featuredImageUrl &&
    !openGraphImageUrl &&
    !resolveFeaturedYouTubeEmbedUrl(featuredMedia.url) &&
    !featuredMedia.mediaUuid
  ) {
    return null;
  }

  const categoryTitle =
    categories.find((c) => String(c.id) === data.article_category_id)?.title ?? "";
  const seoDefaults = buildArticleSeoDefaults({
    title: data.title,
    excerpt: data.excerpt,
    articleDescription: data.article_description,
    tags: data.tags,
    categoryTitle,
  });

  const payload: Record<string, unknown> = {
    title: data.title || "Untitled live update",
    article_description: data.article_description || "",
    slug: data.slug.trim() || slugifyCategoryName(title || "untitled-live-update"),
    visibility: data.visibility,
    is_live_blog: true,
    excerpt: data.excerpt,
    meta_title: data.meta_title.trim() || seoDefaults.meta_title,
    meta_description: data.meta_description.trim() || seoDefaults.meta_description,
    meta_keywords: data.meta_keywords.trim() || seoDefaults.meta_keywords,
    tags: data.tags,
  };

  if (data.article_category_id.trim()) {
    payload.article_category_id = Number(data.article_category_id) || data.article_category_id;
  }

  if (data.scheduled_publishing.trim()) {
    payload.scheduled_publishing = toApiDatetimeValue(data.scheduled_publishing);
  }
  if (data.published_at.trim()) {
    payload.published_at = toApiDatetimeValue(data.published_at);
  }

  appendMediaToPayload(payload, featuredMedia, openGraphImageUrl);

  // Empty string fails Laravel `url` validation — omit when unset.
  if (!payload.live_video_url) {
    delete payload.live_video_url;
  }

  return payload;
}

function applyServerErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<ShellFormValues>>["setError"],
): boolean {
  const fieldErrors = getAuthFieldErrors(error);
  let applied = false;

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (!SHELL_FORM_FIELDS.includes(field as keyof ShellFormValues)) continue;
    setError(field as keyof ShellFormValues, { message });
    applied = true;
  }

  if (!applied && axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (typeof message === "string" && /slug/i.test(message)) {
      setError("slug", { message });
      applied = true;
    }
  }

  return applied;
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function shellDefaults(): ShellFormValues {
  return {
    title: "",
    article_description: "",
    status: "draft",
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
  };
}

function shellFromApi(shell: LiveUpdateShell): ShellFormValues {
  return {
    title: shell.title,
    article_description: shell.articleDescription ?? "",
    status: shell.status,
    visibility: shell.visibility,
    article_category_id: shell.categoryId,
    tags: shell.tags,
    excerpt: shell.excerpt,
    meta_title: shell.metaTitle,
    meta_description: shell.metaDescription,
    meta_keywords: shell.metaKeywords,
    slug: shell.slug,
    scheduled_publishing: toDatetimeLocalValue(shell.scheduledPublishing),
    published_at: toDatetimeLocalValue(shell.publishedAtIso),
  };
}

function mediaFromShell(shell: LiveUpdateShell): FeaturedMediaValue {
  if (!shell.featuredMediaUuid && !shell.featuredMediaUrl && !shell.featuredImageUrl) {
    return emptyFeaturedMediaValue();
  }
  const resolvedUrl =
    resolveFeaturedYouTubeEmbedUrl(shell.featuredMediaUrl || shell.featuredImageUrl) ||
    shell.featuredMediaUrl ||
    shell.featuredImageUrl;
  return {
    type: shell.featuredMediaType ?? "image",
    mediaUuid: shell.featuredMediaUuid,
    url: resolvedUrl,
    thumbnailUrl: shell.featuredThumbnailUrl || shell.featuredImageUrl,
    posterUuid: shell.posterMediaUuid,
    posterUrl: shell.posterUrl,
  };
}

export default function AdminLiveUpdateEditorPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const timeZone = settings.timezone || "America/New_York";

  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [categoryOptions, setCategoryOptions] = React.useState<CategorySearchOption[]>([]);
  const [loading, setLoading] = React.useState(mode === "edit");
  const [saving, setSaving] = React.useState(false);
  const [shellMeta, setShellMeta] = React.useState<LiveUpdateShell | null>(null);
  const [entries, setEntries] = React.useState<LiveUpdateEntry[]>([]);
  const [featuredMedia, setFeaturedMedia] = React.useState<FeaturedMediaValue>(
    emptyFeaturedMediaValue(),
  );
  const [openGraphImageUrl, setOpenGraphImageUrl] = React.useState<string | null>(null);
  const [imagesDirty, setImagesDirty] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const [entryEditorOpen, setEntryEditorOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<LiveUpdateEntry | null>(null);
  const [entryBody, setEntryBody] = React.useState("");
  const [entryPostedAt, setEntryPostedAt] = React.useState("");
  const [entryStatus, setEntryStatus] = React.useState<LiveUpdateEntryStatus>("published");
  const [entrySaving, setEntrySaving] = React.useState(false);

  const featuredMediaRef = React.useRef(featuredMedia);
  const openGraphImageUrlRef = React.useRef(openGraphImageUrl);
  const categoriesRef = React.useRef(categories);
  const navigatedAfterCreateRef = React.useRef(false);

  featuredMediaRef.current = featuredMedia;
  openGraphImageUrlRef.current = openGraphImageUrl;
  categoriesRef.current = categories;

  const form = useForm<ShellFormValues>({
    resolver: zodResolver(shellSchema),
    defaultValues: shellDefaults(),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = form;

  const watchedValues = watch();
  const titleValue = watchedValues.title;
  const statusValue = watchedValues.status;
  const descriptionValue = watchedValues.article_description;
  const currentSlug = watchedValues.slug;
  const hasUnsavedChanges = isDirty || imagesDirty;

  React.useEffect(() => {
    if (slugTouched || mode === "edit") return;
    setValue("slug", slugifyCategoryName(titleValue ?? ""), { shouldDirty: false });
  }, [titleValue, slugTouched, mode, setValue]);

  React.useEffect(() => {
    void (async () => {
      try {
        const response = await request.get("/categories");
        const data = response.data?.data ?? response.data;
        const rows = Array.isArray(data) ? data : [];
        const options = flattenCategoryOptions(rows);
        setCategoryOptions(options);
        setCategories(
          options.map((option) => ({
            id: option.id,
            title: option.title,
            status: option.status,
            parent_title:
              option.label.includes(" / ")
                ? option.label.split(" / ")[0]
                : undefined,
          })),
        );
      } catch {
        setCategories([]);
        setCategoryOptions([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    const slug = normalizeEditorSlug(articleSlug);
    if (mode !== "edit" || !slug) {
      if (mode === "edit" && articleSlug && !slug) {
        toast.error("Invalid live update URL");
        navigate("/admin/live-updates");
      }
      return;
    }
    void (async () => {
      try {
        setLoading(true);
        const shell = await fetchLiveUpdateBySlug(slug);
        setShellMeta(shell);
        setEntries(shell.entries);
        reset(shellFromApi(shell));
        setFeaturedMedia(mediaFromShell(shell));
        setOpenGraphImageUrl(shell.openGraphImageUrl);
        setImagesDirty(false);
        setLastSavedAt(shell.updatedAtIso ?? null);
        setSlugTouched(true);
      } catch {
        toast.error("Failed to load live update");
        navigate("/admin/live-updates");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, articleSlug, navigate, reset]);

  const autoSaveChangeSignature = React.useMemo(
    () =>
      JSON.stringify({
        values: watchedValues,
        featuredMedia,
        openGraphImageUrl,
      }),
    [watchedValues, featuredMedia, openGraphImageUrl],
  );

  const handleAutoSaveSuccess = React.useCallback(
    (result: ArticleAutoSaveResult) => {
      setLastSavedAt(result.updated_at);
      const current = getValues();
      if (result.slug && result.slug !== current.slug) {
        const normalizedSlug = normalizeEditorSlug(result.slug);
        if (normalizedSlug) {
          setValue("slug", normalizedSlug, { shouldDirty: false });
          setSlugTouched(true);
        }
      }
      reset(getValues(), { keepDirty: false });
      setImagesDirty(false);

      const refreshedSlug = normalizeEditorSlug(result.slug);
      if (refreshedSlug) {
        void fetchLiveUpdateBySlug(refreshedSlug)
          .then((shell) => {
            setShellMeta(shell);
            setEntries(shell.entries);
            if (shell.categoryId && !getValues("article_category_id")) {
              setValue("article_category_id", shell.categoryId, { shouldDirty: false });
            }
          })
          .catch(() => {
            /* ignore — next save will refresh */
          });
      }

      if (mode === "create" && refreshedSlug && !navigatedAfterCreateRef.current) {
        navigatedAfterCreateRef.current = true;
        navigate(`/admin/live-updates/edit/${encodeURIComponent(refreshedSlug)}`, {
          replace: true,
        });
      }
    },
    [getValues, mode, navigate, reset, setValue],
  );

  const { autoSaveStatus, getPersistedSlug, setPersistedSlug, resetAutoSaveSnapshot } =
    useArticleAutoSave({
      enabled: settings.enableAutoSave,
      initialSlug: mode === "edit" ? articleSlug : undefined,
      isDirty: hasUnsavedChanges,
      isManualSaving: saving,
      changeSignature: autoSaveChangeSignature,
      getPayload: () =>
        buildLiveAutoSavePayload(
          getValues(),
          featuredMediaRef.current,
          openGraphImageUrlRef.current,
          categoriesRef.current,
        ),
      onSaved: handleAutoSaveSuccess,
      saveFn: (payload, slug, signal) => autoSaveAdminArticle(payload, slug, signal),
    });

  React.useEffect(() => {
    if (shellMeta?.slug) {
      setPersistedSlug(shellMeta.slug);
    }
  }, [shellMeta?.slug, setPersistedSlug]);

  const wordCount = countWords(stripHtml(descriptionValue ?? ""));
  const charCount = stripHtml(descriptionValue ?? "").length;
  const savedSlug =
    getPersistedSlug() ?? shellMeta?.slug ?? articleSlug ?? currentSlug;

  const saveShell = async (status: ArticleStatus) => {
    const valid = await form.trigger();
    if (!valid) return;

    if (liveFeaturedVideoNeedsPoster(featuredMedia)) {
      toast.error("Poster image is required for Live featured media.");
      return;
    }

    const data = form.getValues();
    setSaving(true);
    try {
      const payload = buildShellPayload(
        data,
        status,
        featuredMedia,
        openGraphImageUrl,
        categories,
      );
      const updateSlug = mode === "edit" ? savedSlug : getPersistedSlug();
      const saved = updateSlug
        ? await updateLiveUpdate(updateSlug, payload)
        : await createLiveUpdate(payload);

      setShellMeta(saved);
      setEntries(saved.entries);
      reset(shellFromApi(saved));
      setFeaturedMedia(mediaFromShell(saved));
      setOpenGraphImageUrl(saved.openGraphImageUrl);
      setImagesDirty(false);
      setLastSavedAt(saved.updatedAtIso ?? new Date().toISOString());
      setPersistedSlug(saved.slug);
      resetAutoSaveSnapshot(
        buildLiveAutoSavePayload(
          shellFromApi(saved),
          mediaFromShell(saved),
          saved.openGraphImageUrl,
          categories,
        ) ?? undefined,
      );

      if (saved.slug !== data.slug) {
        setSlugTouched(true);
      }

      toast.success(
        mode === "create" && !updateSlug ? "Live update created" : "Live update saved",
      );

      const redirectSlug = normalizeEditorSlug(saved.slug);
      if (
        redirectSlug &&
        (mode === "create" || (updateSlug && updateSlug !== redirectSlug))
      ) {
        navigatedAfterCreateRef.current = true;
        navigate(`/admin/live-updates/edit/${encodeURIComponent(redirectSlug)}`, {
          replace: true,
        });
      }
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        toast.error(getAuthErrorMessage(error, "Failed to save live update"));
      } else {
        toast.error(getAuthErrorMessage(error, "Please fix the highlighted fields"));
      }
    } finally {
      setSaving(false);
    }
  };

  const onPublish = () => {
    const data = form.getValues();
    const next = resolveStatusAfterPublish(data.scheduled_publishing);
    void saveShell(next);
  };

  const openNewEntry = () => {
    setEditingEntry(null);
    setEntryBody("");
    setEntryPostedAt(toDatetimeLocalValue(new Date().toISOString()));
    setEntryStatus("published");
    setEntryEditorOpen(true);
  };

  const openEditEntry = (entry: LiveUpdateEntry) => {
    setEditingEntry(entry);
    setEntryBody(entry.body);
    setEntryPostedAt(toDatetimeLocalValue(entry.postedAt));
    setEntryStatus(entry.status);
    setEntryEditorOpen(true);
  };

  const saveEntry = async () => {
    if (!savedSlug || (mode === "create" && !getPersistedSlug() && !shellMeta)) {
      toast.error("Save the live update shell before adding entries");
      return;
    }
    if (!stripHtml(entryBody).trim()) {
      toast.error("Update body is required");
      return;
    }

    setEntrySaving(true);
    try {
      const payload = {
        body: entryBody,
        posted_at: entryPostedAt.trim() ? toApiDatetimeValue(entryPostedAt) : null,
        status: entryStatus,
      };
      if (editingEntry) {
        const updated = await updateLiveUpdateEntry(savedSlug, editingEntry.id, payload);
        setEntries((prev) =>
          prev
            .map((e) => (e.id === updated.id ? updated : e))
            .sort((a, b) => {
              const at = a.postedAt ? new Date(a.postedAt).getTime() : 0;
              const bt = b.postedAt ? new Date(b.postedAt).getTime() : 0;
              return bt - at || b.id - a.id;
            }),
        );
        toast.success("Update saved");
      } else {
        const created = await createLiveUpdateEntry(savedSlug, payload);
        setEntries((prev) =>
          [created, ...prev].sort((a, b) => {
            const at = a.postedAt ? new Date(a.postedAt).getTime() : 0;
            const bt = b.postedAt ? new Date(b.postedAt).getTime() : 0;
            return bt - at || b.id - a.id;
          }),
        );
        toast.success("Update published");
      }
      setEntryEditorOpen(false);
      setEditingEntry(null);
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Failed to save update"));
    } finally {
      setEntrySaving(false);
    }
  };

  const removeEntry = async (entry: LiveUpdateEntry) => {
    if (!savedSlug) return;
    if (!window.confirm("Delete this update?")) return;
    try {
      await deleteLiveUpdateEntry(savedSlug, entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      toast.success("Update deleted");
    } catch {
      toast.error("Failed to delete update");
    }
  };

  const toggleLive = async () => {
    if (!savedSlug || !shellMeta) return;
    try {
      const updated = shellMeta.isLive
        ? await endLiveUpdateCoverage(savedSlug)
        : await startLiveUpdateCoverage(savedSlug);
      setShellMeta(updated);
      toast.success(updated.isLive ? "Live coverage started" : "Live coverage ended");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Failed to update live status"));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-admin-label">
        Loading live update…
      </div>
    );
  }

  const previewPublishSource =
    statusValue === "scheduled"
      ? watchedValues.scheduled_publishing
      : statusValue === "published"
        ? watchedValues.published_at
        : "";

  const previewData = {
    title: watchedValues.title ?? "",
    article_description: watchedValues.article_description ?? "",
    excerpt: watchedValues.excerpt ?? "",
    category:
      categoryOptions.find((c) => c.id === watchedValues.article_category_id)?.label ?? "",
    tags: watchedValues.tags ?? [],
    authorName: "",
    featuredImageUrl: featuredImageUrlFromMedia(featuredMedia) ?? "",
    status: (statusValue || "draft") as ArticleStatus,
    publishDisplayAt: previewPublishSource
      ? toApiDatetimeValue(previewPublishSource) || previewPublishSource
      : undefined,
  };

  const canEditTimeline = Boolean(savedSlug && (mode === "edit" || shellMeta));
  const showLiveToggle = Boolean(savedSlug && (mode === "edit" || shellMeta));
  const canToggleLiveCoverage = statusValue === "published";

  return (
    <div className="space-y-4 pb-10 sm:space-y-6">
      <ArticleEditorTopBar
        wordCount={wordCount}
        charCount={charCount}
        status={statusValue}
        lastSavedLabel={formatArticleLastSaved(lastSavedAt, timeZone)}
        isDirty={hasUnsavedChanges}
        autoSaveStatus={autoSaveStatus}
        onBack={() => navigate("/admin/live-updates")}
        onPreview={() => setIsPreviewOpen(true)}
        onSave={() => void saveShell(statusValue)}
        onSaveDraft={() => void saveShell("draft")}
        onPublish={onPublish}
        liveCoverage={
          showLiveToggle
            ? {
                isLive: Boolean(shellMeta?.isLive),
                disabled: !canToggleLiveCoverage,
                disabledReason: "Publish this live update before starting coverage.",
                onToggle: () => void toggleLive(),
              }
            : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2 px-1">
        <h1 className="text-lg font-semibold text-admin-heading sm:text-xl">
          {mode === "create" && !shellMeta ? "New Live Update" : "Edit Live Update"}
        </h1>
        {shellMeta?.isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
            LIVE
          </span>
        ) : null}
      </div>

      <form
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        onSubmit={handleSubmit(() => void saveShell(statusValue))}
      >
        <div className="space-y-6">
          <ArticleRichTextEditor
            title={titleValue}
            onTitleChange={(value) =>
              setValue("title", value, { shouldDirty: true, shouldValidate: true })
            }
            titleError={errors.title?.message}
            content={descriptionValue}
            onContentChange={(value) =>
              setValue("article_description", value, { shouldDirty: true })
            }
            contentError={errors.article_description?.message}
          />
          <p className="text-xs text-admin-label">
            Optional intro shown above the live timeline on the public page.
          </p>

          {canEditTimeline ? (
            <AdminPanel className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-admin-heading">Timeline</h2>
                  <p className="text-sm text-admin-label">
                    Newest updates appear first. Each entry supports full editor media.
                  </p>
                </div>
                <Button type="button" onClick={openNewEntry} className="gap-2">
                  <Plus className="size-4" aria-hidden />
                  Add update
                </Button>
              </div>

              {entryEditorOpen ? (
                <div className="space-y-4 rounded-[12px] border border-admin-input-border p-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1">
                      <label className={fieldLabelClassName}>Posted at</label>
                      <Input
                        type="datetime-local"
                        value={entryPostedAt}
                        onChange={(e) => setEntryPostedAt(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="w-40">
                      <label className={fieldLabelClassName}>Status</label>
                      <Select
                        value={entryStatus}
                        onValueChange={(v) =>
                          setEntryStatus(v as LiveUpdateEntryStatus)
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <ArticleRichTextEditor
                    hideTitle
                    content={entryBody}
                    onContentChange={setEntryBody}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={entrySaving || saving}
                      onClick={() => void saveEntry()}
                    >
                      {entrySaving
                        ? "Saving…"
                        : editingEntry
                          ? "Save update"
                          : "Publish update"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEntryEditorOpen(false);
                        setEditingEntry(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {entries.length === 0 ? (
                  <p className="py-6 text-center text-sm text-admin-label">
                    No updates yet. Add the first timestamped update.
                  </p>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-[12px] border border-admin-input-border p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <time className="font-semibold text-admin-heading">
                            {formatWhen(entry.postedAt)}
                          </time>
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-xs font-semibold",
                              entry.status === "published"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800",
                            )}
                          >
                            {entry.status === "published" ? "Published" : "Draft"}
                          </span>
                          {entry.userName ? (
                            <span className="text-admin-label">{entry.userName}</span>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEditEntry(entry)}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void removeEntry(entry)}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </Button>
                        </div>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-admin-heading [&_img]:max-h-60 [&_img]:rounded-md"
                        dangerouslySetInnerHTML={{ __html: entry.body }}
                      />
                    </div>
                  ))
                )}
              </div>
            </AdminPanel>
          ) : (
            <AdminPanel>
              <p className="text-sm text-admin-label">
                Save the live update shell first (or wait for autosave), then add unlimited
                timestamped updates from the editor.
              </p>
            </AdminPanel>
          )}
        </div>

        <div className="space-y-4">
          <AdminPanel className="space-y-4">
            <div>
              <label className={fieldLabelClassName}>Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_WORKFLOW_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ARTICLE_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className={fieldLabelClassName}>Visibility</label>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
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
            </div>

            {statusValue === "scheduled" ? (
              <div>
                <label className={fieldLabelClassName}>Schedule</label>
                <Input
                  type="datetime-local"
                  className="mt-1.5"
                  {...register("scheduled_publishing")}
                />
                <InputError message={errors.scheduled_publishing?.message} />
              </div>
            ) : null}

            {statusValue === "published" ? (
              <div>
                <label className={fieldLabelClassName}>Published at</label>
                <Input
                  type="datetime-local"
                  className="mt-1.5"
                  {...register("published_at")}
                />
              </div>
            ) : null}

            <div>
              <label className={fieldLabelClassName}>Category</label>
              <Controller
                control={control}
                name="article_category_id"
                render={({ field }) => (
                  <CategorySearchSelect
                    options={categoryOptions}
                    value={field.value}
                    onChange={(next) => {
                      field.onChange(next);
                    }}
                    placeholder="Select category"
                    className="mt-1.5"
                  />
                )}
              />
              <InputError message={errors.article_category_id?.message} />
            </div>

            <div>
              <label className={fieldLabelClassName}>Slug</label>
              <Input
                className="mt-1.5"
                placeholder="live-update-url-slug"
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
              <InputError message={errors.slug?.message} />
            </div>

            <div>
              <label className={fieldLabelClassName}>Tags</label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <ArticleTagInput tags={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div>
              <label className={fieldLabelClassName}>Excerpt</label>
              <textarea
                className="mt-1.5 min-h-20 w-full rounded-[10px] border border-admin-input-border bg-white px-3 py-2 text-sm"
                {...register("excerpt")}
              />
            </div>
          </AdminPanel>

          <AdminPanel className="space-y-4">
            <h2 className="text-sm font-semibold text-admin-heading">Featured media</h2>
            <FeaturedMediaField
              value={featuredMedia}
              onChange={(next) => {
                setFeaturedMedia(next);
                setImagesDirty(true);
              }}
              allowedTypes={["image", "video"]}
              typeLabels={{ video: "Live" }}
              videoSource="youtube"
              posterRequired
            />
            <div>
              <label className={fieldLabelClassName}>Open Graph image</label>
              <MediaImageField
                value={openGraphImageUrl}
                onChange={(url) => {
                  setOpenGraphImageUrl(url);
                  setImagesDirty(true);
                }}
                className="mt-1.5"
              />
            </div>
          </AdminPanel>

          <AdminPanel className="space-y-3">
            <h2 className="text-sm font-semibold text-admin-heading">SEO</h2>
            <div>
              <label className={fieldLabelClassName}>Meta title</label>
              <Input className="mt-1.5" {...register("meta_title")} />
            </div>
            <div>
              <label className={fieldLabelClassName}>Meta description</label>
              <textarea
                className="mt-1.5 min-h-20 w-full rounded-[10px] border border-admin-input-border bg-white px-3 py-2 text-sm"
                {...register("meta_description")}
              />
            </div>
            <div>
              <label className={fieldLabelClassName}>Meta keywords</label>
              <Input className="mt-1.5" {...register("meta_keywords")} />
            </div>
          </AdminPanel>
        </div>
      </form>

      <ArticlePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        preview={previewData}
      />
    </div>
  );
}
