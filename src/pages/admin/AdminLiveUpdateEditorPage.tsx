import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Plus, Radio, Trash2 } from "lucide-react";
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
import {
  emptyFeaturedMediaValue,
  FeaturedMediaField,
  type FeaturedMediaValue,
} from "@/components/admin/media/FeaturedMediaField";
import { MediaImageField } from "@/components/admin/media/MediaImageField";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
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
  resolveStatusAfterPublish,
} from "@/data/admin/articleWorkflow";
import {
  ARTICLE_VISIBILITY_LABELS,
  ARTICLE_VISIBILITY_VALUES,
} from "@/data/admin/articleVisibility";
import { slugifyCategoryName } from "@/data/admin/categoryStore";
import type { ArticleStatus } from "@/data/admin/mockArticles";
import { toApiDatetimeValue, toDatetimeLocalValue } from "@/lib/datetime";
import { getAuthErrorMessage, getAuthFieldErrors } from "@/features/auth/errorMessage";
import { cn } from "@/lib/utils";
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

const fieldLabelClassName =
  "block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm";

function featuredImageUrlFromMedia(media: FeaturedMediaValue): string | null {
  if (media.type === "image") return media.url;
  return media.posterUrl || media.thumbnailUrl || null;
}

function appendMediaToPayload(
  payload: Record<string, unknown>,
  featuredMedia: FeaturedMediaValue,
  openGraphImageUrl: string | null,
) {
  const liveVideoUrl =
    featuredMedia.type === "video" &&
    featuredMedia.url?.includes("youtube.com/embed/")
      ? featuredMedia.url
      : "";

  payload.featured_image = featuredImageUrlFromMedia(featuredMedia) ?? "";
  payload.open_graph_image = openGraphImageUrl ?? "";
  payload.live_video_url = liveVideoUrl;

  if (liveVideoUrl) {
    // YouTube is external media; the Cloudinary poster URL is persisted as featured_image.
    payload.featured_media_uuid = "";
    payload.poster_media_uuid = "";
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
    article_description: shell.articleDescription,
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
  return {
    type: shell.featuredMediaType ?? "image",
    mediaUuid: shell.featuredMediaUuid,
    url: shell.featuredMediaUrl || shell.featuredImageUrl,
    thumbnailUrl: shell.featuredThumbnailUrl || shell.featuredImageUrl,
    posterUuid: shell.posterMediaUuid,
    posterUrl: shell.posterUrl,
  };
}

export default function AdminLiveUpdateEditorPage({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [loading, setLoading] = React.useState(mode === "edit");
  const [saving, setSaving] = React.useState(false);
  const [shellMeta, setShellMeta] = React.useState<LiveUpdateShell | null>(null);
  const [entries, setEntries] = React.useState<LiveUpdateEntry[]>([]);
  const [featuredMedia, setFeaturedMedia] = React.useState<FeaturedMediaValue>(
    emptyFeaturedMediaValue(),
  );
  const [openGraphImageUrl, setOpenGraphImageUrl] = React.useState<string | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");

  const [entryEditorOpen, setEntryEditorOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<LiveUpdateEntry | null>(null);
  const [entryBody, setEntryBody] = React.useState("");
  const [entryPostedAt, setEntryPostedAt] = React.useState("");
  const [entryStatus, setEntryStatus] = React.useState<LiveUpdateEntryStatus>("published");
  const [entrySaving, setEntrySaving] = React.useState(false);

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
    reset,
    formState: { errors, isDirty },
  } = form;

  const titleValue = watch("title");
  const statusValue = watch("status");
  const descriptionValue = watch("article_description");
  const currentSlug = watch("slug");

  React.useEffect(() => {
    if (slugTouched || mode === "edit") return;
    setValue("slug", slugifyCategoryName(titleValue ?? ""), { shouldDirty: false });
  }, [titleValue, slugTouched, mode, setValue]);

  React.useEffect(() => {
    void (async () => {
      try {
        const response = await request.get("/categories");
        const data = response.data?.data ?? response.data;
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (mode !== "edit" || !articleSlug) return;
    void (async () => {
      try {
        setLoading(true);
        const shell = await fetchLiveUpdateBySlug(articleSlug);
        setShellMeta(shell);
        setEntries(shell.entries);
        reset(shellFromApi(shell));
        setFeaturedMedia(mediaFromShell(shell));
        setOpenGraphImageUrl(shell.openGraphImageUrl);
      } catch {
        toast.error("Failed to load live update");
        navigate("/admin/live-updates");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, articleSlug, navigate, reset]);

  const wordCount = countWords(stripHtml(descriptionValue ?? ""));
  const charCount = stripHtml(descriptionValue ?? "").length;
  const savedSlug = shellMeta?.slug ?? articleSlug ?? currentSlug;

  const saveShell = async (status: ArticleStatus) => {
    const valid = await form.trigger();
    if (!valid) return;

    if (
      featuredMedia.type === "video" &&
      (featuredMedia.url || featuredMedia.mediaUuid) &&
      !featuredMedia.posterUrl &&
      !featuredMedia.posterUuid
    ) {
      toast("Poster image is recommended for Live featured media.", {
        icon: "ℹ️",
      });
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
      const saved =
        mode === "create"
          ? await createLiveUpdate(payload)
          : await updateLiveUpdate(savedSlug, payload);

      setShellMeta(saved);
      setEntries(saved.entries);
      reset(shellFromApi(saved));
      setFeaturedMedia(mediaFromShell(saved));
      toast.success(mode === "create" ? "Live update created" : "Live update saved");

      if (mode === "create") {
        navigate(`/admin/live-updates/edit/${encodeURIComponent(saved.slug)}`, {
          replace: true,
        });
      }
    } catch (error) {
      const fieldErrors = getAuthFieldErrors(error);
      Object.entries(fieldErrors).forEach(([key, messages]) => {
        if (key in form.getValues()) {
          form.setError(key as keyof ShellFormValues, {
            message: messages[0],
          });
        }
      });
      toast.error(getAuthErrorMessage(error, "Failed to save live update"));
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
    if (!savedSlug || mode === "create") {
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

  return (
    <div className="space-y-4 pb-10 sm:space-y-6">
      <ArticleEditorTopBar
        wordCount={wordCount}
        charCount={charCount}
        status={statusValue}
        lastSavedLabel={shellMeta?.updatedAtIso ? formatWhen(shellMeta.updatedAtIso) : "—"}
        isDirty={isDirty}
        onBack={() => navigate("/admin/live-updates")}
        onSave={() => void saveShell(statusValue)}
        onSaveDraft={() => void saveShell("draft")}
        onPublish={onPublish}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-admin-heading sm:text-xl">
            {mode === "create" ? "New Live Update" : "Edit Live Update"}
          </h1>
          {shellMeta?.isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE
            </span>
          ) : null}
        </div>
        {mode === "edit" && shellMeta?.status === "published" ? (
          <Button
            type="button"
            variant={shellMeta.isLive ? "outline" : "default"}
            onClick={() => void toggleLive()}
            className="gap-2"
          >
            <Radio className="size-4" aria-hidden />
            {shellMeta.isLive ? "End Live" : "Start Live"}
          </Button>
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

          {mode === "edit" ? (
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
                Save the live update shell first, then add unlimited timestamped updates from
                the editor.
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={String(category.id)} value={String(category.id)}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <InputError message={errors.article_category_id?.message} />
            </div>

            <div>
              <label className={fieldLabelClassName}>Slug</label>
              <Input
                className="mt-1.5"
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
              onChange={setFeaturedMedia}
              allowedTypes={["image", "video"]}
              typeLabels={{ video: "Live" }}
              videoSource="youtube"
            />
            <div>
              <label className={fieldLabelClassName}>Open Graph image</label>
              <MediaImageField
                value={openGraphImageUrl}
                onChange={setOpenGraphImageUrl}
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
    </div>
  );
}
