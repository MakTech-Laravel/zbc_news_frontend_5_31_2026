import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListOrdered, Plus, Save } from "lucide-react";

import { CategoryReorderList } from "@/components/admin/categories/CategoryReorderList";
import {
  useCategoriesDataTable,
  type AdminCategoryRow,
  type AdminCategoryStatus,
} from "@/components/admin/categories/useCategoriesDataTable";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/data/admin/mockCategories";
import { slugifyCategoryName } from "@/data/admin/categoryStore";
import {
  buildCategorySeoDefaults,
  META_DESCRIPTION_MAX_LENGTH,
  META_KEYWORDS_MAX_LENGTH,
  META_TITLE_MAX_LENGTH,
} from "@/components/admin/articles/articleEditorUtils";
import InputError from "@/components/input-error";
import {
  createCategory,
  deleteCategory as deleteCategoryRequest,
  fetchCategories,
  moveCategory,
  reorderCategories,
  updateCategory,
  type AdminCategory,
} from "@/services/admin/categories";
import { AdminToggle } from "@/components/admin/monetization/AdminToggle";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

function mapApiCategory(category: AdminCategory): AdminCategoryRow {
  return {
    id: String(category.id),
    title: category.title,
    slug: category.slug,
    status: category.status,
    sort_order: Number(category.sort_order ?? 0),
    is_featured: Boolean(category.is_featured),
    articleCount: 0,
    created_at: category.created_at ?? "",
    updated_at: category.updated_at ?? "",
    meta_title: category.meta_title ?? undefined,
    meta_description: category.meta_description ?? undefined,
    meta_keywords: category.meta_keywords ?? undefined,
  };
}

function formatCreatedAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const BASE_CATEGORY_TABLE_COLUMNS: DataTableColumn<AdminCategoryRow>[] = [
  {
    id: "sort_order",
    header: "Pos",
    type: "custom",
    render: (row) => (
      <span className="text-sm tabular-nums text-admin-trend-muted">{row.sort_order}</span>
    ),
    className: "w-14 whitespace-nowrap",
  },
  {
    id: "title",
    header: "Category",
    type: "stack",
    primary: (row) => row.title,
    secondary: (row) => `/${row.slug}`,
    className: "min-w-[160px]",
  },
  {
    id: "status",
    header: "Status",
    hideOnMobile: true,
    type: "badge",
    badge: (row) => ({
      variant: row.status,
      label: row.status === "active" ? "Active" : "Inactive",
    }),
    className: "whitespace-nowrap",
  },
  {
    id: "created_at",
    header: "Created",
    hideOnMobile: true,
    type: "custom",
    render: (row) => (
      <span className="text-sm text-admin-trend-muted">
        {formatCreatedAt(row.created_at)}
      </span>
    ),
    className: "whitespace-nowrap text-admin-trend-muted",
  },
];

const categoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["active", "inactive"]),
  is_featured: z.boolean(),
  meta_title: z.string().max(META_TITLE_MAX_LENGTH),
  meta_description: z.string().max(META_DESCRIPTION_MAX_LENGTH),
  meta_keywords: z.string().max(META_KEYWORDS_MAX_LENGTH),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

function matchesSearch(category: AdminCategoryRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    category.title.toLowerCase().includes(q) ||
    category.slug.toLowerCase().includes(q) ||
    (category.description?.toLowerCase().includes(q) ?? false)
  );
}

function sortByPosition(rows: AdminCategoryRow[]): AdminCategoryRow[] {
  return [...rows].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return Number(a.id) - Number(b.id);
  });
}

export default function AdminCategories() {
  const [categories, setCategories] = React.useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [reorderMode, setReorderMode] = React.useState(false);
  const [reorderDraft, setReorderDraft] = React.useState<AdminCategoryRow[]>([]);
  const [savingOrder, setSavingOrder] = React.useState(false);
  const [orderDirty, setOrderDirty] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [togglingFeaturedIds, setTogglingFeaturedIds] = React.useState<Set<string>>(new Set());

  const isEditing = editingCategoryId !== null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      status: "active",
      is_featured: false,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    },
  });

  const nameValue = watch("title");
  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugifyCategoryName(nameValue ?? ""));
    }
  }, [nameValue, slugTouched, setValue]);

  const loadCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const rows = await fetchCategories();
      setCategories(sortByPosition(rows.map(mapApiCategory)));
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    const onFocus = () => {
      if (!reorderMode) void loadCategories();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadCategories, reorderMode]);

  const enterReorderMode = () => {
    setReorderDraft(sortByPosition(categories));
    setOrderDirty(false);
    setReorderMode(true);
  };

  const exitReorderMode = () => {
    setReorderMode(false);
    setOrderDirty(false);
    setReorderDraft([]);
  };

  const applyServerOrder = (rows: AdminCategory[]) => {
    const mapped = sortByPosition(rows.map(mapApiCategory));
    setCategories(mapped);
    setReorderDraft(mapped);
    setOrderDirty(false);
  };

  const handleLocalReorder = (next: AdminCategoryRow[]) => {
    setReorderDraft(
      next.map((row, index) => ({
        ...row,
        sort_order: index + 1,
      })),
    );
    setOrderDirty(true);
  };

  const handleMoveToPosition = async (category: AdminCategoryRow, position: number) => {
    try {
      setSavingOrder(true);
      const rows = await moveCategory(category.slug, position);
      applyServerOrder(rows);
      toast.success("Category position updated");
    } catch {
      toast.error("Failed to update position");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      const rows = await reorderCategories(reorderDraft.map((row) => row.id));
      applyServerOrder(rows);
      toast.success("Category order saved");
    } catch {
      toast.error("Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    const seoDefaults = buildCategorySeoDefaults(data.title, data.slug);
    const payload = {
      ...data,
      meta_title: data.meta_title.trim() || seoDefaults.meta_title,
      meta_description: data.meta_description.trim() || seoDefaults.meta_description,
      meta_keywords: data.meta_keywords.trim() || seoDefaults.meta_keywords,
    };

    try {
      if (isEditing) {
        await updateCategory(editingCategoryId, payload);
        toast.success("Category updated successfully");
      } else {
        await createCategory(payload);
        toast.success("Category created successfully");
      }
      await loadCategories();
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  const deleteCategory = async (category: AdminCategoryRow) => {
    try {
      await deleteCategoryRequest(category.slug);
      toast.success("Category deleted successfully");
      await loadCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const toggleFeatured = React.useCallback(async (category: AdminCategoryRow, next: boolean) => {
    const rowId = String(category.id);
    setTogglingFeaturedIds((prev) => new Set(prev).add(rowId));
    setCategories((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, is_featured: next } : row)),
    );

    try {
      await updateCategory(category.slug, {
        title: category.title,
        slug: category.slug,
        status: category.status,
        is_featured: next,
        meta_title: category.meta_title ?? "",
        meta_description: category.meta_description ?? "",
        meta_keywords: category.meta_keywords ?? "",
      });
      toast.success(next ? "Category featured in header" : "Category removed from featured");
    } catch {
      setCategories((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, is_featured: category.is_featured } : row,
        ),
      );
      toast.error("Failed to update featured status");
    } finally {
      setTogglingFeaturedIds((prev) => {
        const nextSet = new Set(prev);
        nextSet.delete(rowId);
        return nextSet;
      });
    }
  }, []);

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setSlugTouched(false);
    reset({
      title: "",
      slug: "",
      status: "active",
      is_featured: false,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminCategoryRow) => {
    setEditingCategoryId(category.slug);
    setSlugTouched(true);
    reset({
      title: category.title,
      slug: category.slug,
      status: category.status,
      is_featured: category.is_featured,
      meta_title: category.meta_title ?? "",
      meta_description: category.meta_description ?? "",
      meta_keywords: category.meta_keywords ?? "",
    });
    setIsModalOpen(true);
  };

  const filtered = React.useMemo(() => {
    return categories.filter((category) => {
      if (!matchesSearch(category, search)) return false;
      if (statusFilter !== "all" && category.status !== statusFilter) return false;
      return true;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns = React.useMemo<DataTableColumn<AdminCategoryRow>[]>(() => {
    const featuredColumn: DataTableColumn<AdminCategoryRow> = {
      id: "is_featured",
      header: "Featured",
      hideOnMobile: true,
      type: "custom",
      render: (row) => {
        const busy = togglingFeaturedIds.has(String(row.id));
        return (
          <AdminToggle
            id={`category-featured-${row.id}`}
            checked={row.is_featured}
            aria-label={`Toggle featured for ${row.title}`}
            className={cn(busy && "pointer-events-none opacity-60")}
            onCheckedChange={(checked) => {
              if (busy) return;
              void toggleFeatured(row, checked);
            }}
          />
        );
      },
      className: "whitespace-nowrap",
    };

    return [
      BASE_CATEGORY_TABLE_COLUMNS[0],
      BASE_CATEGORY_TABLE_COLUMNS[1],
      featuredColumn,
      ...BASE_CATEGORY_TABLE_COLUMNS.slice(2),
    ];
  }, [togglingFeaturedIds, toggleFeatured]);

  const table = useCategoriesDataTable({
    data: paged,
    columns,
    selectedIds,
    onSelectionChange: setSelectedIds,
    onEdit: openEditModal,
    onDelete: deleteCategory,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Categories"
        description={
          reorderMode
            ? "Drag rows or set a position number, then save the order"
            : "Manage news categories"
        }
        actions={
          <>
            {reorderMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full sm:w-auto"
                  onClick={exitReorderMode}
                  disabled={savingOrder}
                >
                  Done
                </Button>
                <Button
                  type="button"
                  className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
                  onClick={() => void handleSaveOrder()}
                  disabled={savingOrder || !orderDirty}
                >
                  <Save className="size-5" aria-hidden />
                  {savingOrder ? "Saving…" : "Save order"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-2 sm:w-auto"
                  onClick={enterReorderMode}
                  disabled={loading || categories.length === 0}
                >
                  <ListOrdered className="size-5" aria-hidden />
                  Reorder
                </Button>
                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
                >
                  <Plus className="size-5" aria-hidden />
                  New Category
                </Button>
              </>
            )}
          </>
        }
      />

      {!reorderMode ? (
        <AdminPanel>
          <AdminFilterBar
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search categories by name or slug..."
            statusValue={statusFilter}
            onStatusChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            statusOptions={[...CATEGORY_STATUS_FILTER_OPTIONS]}
            showCategoryFilter={false}
          />
        </AdminPanel>
      ) : null}

      <AdminPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : reorderMode ? (
          <CategoryReorderList
            items={reorderDraft}
            onReorder={handleLocalReorder}
            onMoveToPosition={(category, position) => {
              void handleMoveToPosition(category, position);
            }}
            disabled={savingOrder}
          />
        ) : (
          <DataTable {...table} />
        )}
      </AdminPanel>

      {!reorderMode ? (
        <AdminPagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent
          className={cn(
            "flex max-h-[min(90dvh,100%)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden",
            "border-[#DDD8C8] bg-primary-foreground p-4 sm:w-full sm:p-6",
          )}
        >
          <DialogHeader className="shrink-0 pr-8 text-left">
            <DialogTitle className="text-xl font-bold text-[#151000] sm:text-2xl">
              {isEditing ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <label
                  htmlFor="category-name"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Name
                </label>
                <Input id="category-name" placeholder="Category name" {...register("title")} />
                <InputError message={errors.title?.message} />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="category-slug"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Slug
                </label>
                <Input
                  id="category-slug"
                  placeholder="category-slug"
                  {...register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                />
                <InputError message={errors.slug?.message} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as AdminCategoryStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputError message={errors.status?.message} />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-admin-surface/40 px-4 py-3">
                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="category-featured"
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="mt-0.5 size-4 rounded border-border text-zbc-blue focus:ring-zbc-blue"
                    />
                  )}
                />
                <div className="min-w-0">
                  <label
                    htmlFor="category-featured"
                    className="block text-sm font-semibold text-admin-heading"
                  >
                    Featured in header
                  </label>
                  <p className="mt-0.5 text-xs text-admin-trend-muted">
                    Featured categories appear next to Home in the main navigation.
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-admin-surface/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-admin-heading">SEO metadata</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      const title = watch("title");
                      const slug = watch("slug");
                      const defaults = buildCategorySeoDefaults(title, slug);
                      setValue("meta_title", defaults.meta_title);
                      setValue("meta_description", defaults.meta_description);
                      setValue("meta_keywords", defaults.meta_keywords);
                    }}
                  >
                    Generate from category
                  </Button>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                    Meta title
                  </label>
                  <Input placeholder="Leave empty to auto-fill on save" {...register("meta_title")} />
                  <InputError message={errors.meta_title?.message} />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                    Meta description
                  </label>
                  <textarea
                    rows={3}
                    {...register("meta_description")}
                    className="flex min-h-[72px] w-full resize-none rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 py-2 text-base shadow-sm md:text-sm"
                  />
                  <InputError message={errors.meta_description?.message} />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                    Meta keywords
                  </label>
                  <textarea
                    rows={2}
                    {...register("meta_keywords")}
                    className="flex min-h-[56px] w-full resize-none rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 py-2 text-base shadow-sm md:text-sm"
                  />
                  <InputError message={errors.meta_keywords?.message} />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full sm:w-auto"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-10 w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditing
                      ? "Saving…"
                      : "Creating…"
                    : isEditing
                      ? "Save"
                      : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
