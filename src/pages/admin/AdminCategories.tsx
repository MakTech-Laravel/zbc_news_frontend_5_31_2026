import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


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
import { request } from "@/api/request";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ADMIN_CATEGORY_TABLE_COLUMNS: DataTableColumn<AdminCategoryRow>[] = [
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

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const categoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["active", "inactive"]),
  meta_title: z.string().max(META_TITLE_MAX_LENGTH),
  meta_description: z.string().max(META_DESCRIPTION_MAX_LENGTH),
  meta_keywords: z.string().max(META_KEYWORDS_MAX_LENGTH),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesSearch(category: AdminCategoryRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    category.title.toLowerCase().includes(q) ||
    category.slug.toLowerCase().includes(q) ||
    (category.description?.toLowerCase().includes(q) ?? false)
  );
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCategories() {
  // ── State ──────────────────────────────────────────────────────────────────

  const [categories, setCategories] = React.useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  // const [isDeleting, setIsDeleting] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategoryId, setEditingCategoryId] = React.useState<
    string | null
  >(null);
  const [slugTouched, setSlugTouched] = React.useState(false);

  const isEditing = editingCategoryId !== null;

  // ── React Hook Form ────────────────────────────────────────────────────────

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
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    },
  });

  // Name change slug auto-generate
  const nameValue = watch("title");
  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugifyCategoryName(nameValue ?? ""));
    }
  }, [nameValue, slugTouched, setValue]);

  // ── API: GET — all categories load ──────────────────────────────────────

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await request.get("/categories");
      setCategories(response.data.data);
      console.log("CATEGORIES:", response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  // Tab focus event refresh
  React.useEffect(() => {
    const onFocus = () => fetchCategories();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── API: POST / PUT — Form submit ──────────────────────────────────────────

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
        await request.post(`/admin/categories/update/${editingCategoryId}`, payload);
        toast.success("Category updated successfully");
      } else {
        // POST — new category create
        await request.post("/admin/categories/store", payload);
        toast.success("Category created successfully");
      }
      await fetchCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Failed to save category");
      console.log("DATA:", (error as any).response?.data);
    }
  };

  // ── API: DELETE — category delete ──────────────────────────────────────

  const deleteCategory = async (category: AdminCategoryRow) => {
    try {
      // setIsDeleting(true);
      await request.delete(`/admin/categories/delete/${category.slug}`);
      toast.success("Category deleted successfully");
      await fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    } finally {
      // setIsDeleting(false);
    }
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setSlugTouched(false);
    reset({ title: "", slug: "", status: "active", meta_title: "", meta_description: "", meta_keywords: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminCategoryRow) => {
    setEditingCategoryId(category.slug);
    setSlugTouched(true);
    reset({
      title: category.title,
      slug: category.slug,
      status: category.status,
      meta_title: (category as { meta_title?: string }).meta_title ?? "",
      meta_description: (category as { meta_description?: string }).meta_description ?? "",
      meta_keywords: (category as { meta_keywords?: string }).meta_keywords ?? "",
    });
    setIsModalOpen(true);
  };

  // ── Filtering & Pagination ─────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    return categories.filter((category) => {
      if (!matchesSearch(category, search)) return false;
      if (statusFilter !== "all" && category.status !== statusFilter)
        return false;
      return true;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ── Table ──────────────────────────────────────────────────────────────────

  const table = useCategoriesDataTable({
    data: paged,
    columns: ADMIN_CATEGORY_TABLE_COLUMNS,
    selectedIds,
    onSelectionChange: setSelectedIds,
    onEdit: openEditModal,
    onDelete: deleteCategory,
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage news categories"
        actionLabel="New Category"
        onAction={openCreateModal}
      />

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

      <AdminPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable {...table} />
        )}
      </AdminPanel>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Create / Edit Modal */}
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
              {/* Name */}
              <div className="space-y-1">
                <label
                  htmlFor="category-name"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Name
                </label>
                <Input
                  id="category-name"
                  placeholder="Category name"
                  {...register("title")}
                />
                <InputError message={errors.title?.message} />
              </div>

              {/* Slug */}
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

              {/* Status */}
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
                      onValueChange={(value) =>
                        field.onChange(value as AdminCategoryStatus)
                      }
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

              {/* Actions */}
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
                <Button
                  type="submit"
                  className="h-10 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
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
