import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, ListOrdered, Plus, Save } from "lucide-react";

import {
  CategoryReorderList,
  type CategoryReorderGroup,
} from "@/components/admin/categories/CategoryReorderList";
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
import { usePermission, PERMISSIONS } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;
const NONE_PARENT = "__none__";

function mapApiCategory(category: AdminCategory): AdminCategoryRow {
  return {
    id: String(category.id),
    title: category.title,
    slug: category.slug,
    status: category.status,
    sort_order: Number(category.sort_order ?? 0),
    is_featured: Boolean(category.is_featured),
    parent_id: category.parent_id != null ? String(category.parent_id) : null,
    parent_title: category.parent?.title,
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

function sortByPosition(rows: AdminCategoryRow[]): AdminCategoryRow[] {
  return [...rows].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return Number(a.id) - Number(b.id);
  });
}

/** Roots in order, each followed by its children in order. */
function sortHierarchical(rows: AdminCategoryRow[]): AdminCategoryRow[] {
  const roots = sortByPosition(rows.filter((row) => !row.parent_id));
  const childrenByParent = new Map<string, AdminCategoryRow[]>();

  for (const row of rows) {
    if (!row.parent_id) continue;
    const list = childrenByParent.get(row.parent_id) ?? [];
    list.push(row);
    
    childrenByParent.set(row.parent_id, list);
  }

  const out: AdminCategoryRow[] = [];
  for (const root of roots) {
    out.push(root);
    out.push(...sortByPosition(childrenByParent.get(root.id) ?? []));
  }

  const placed = new Set(out.map((row) => row.id));
  for (const row of sortByPosition(rows)) {
    if (!placed.has(row.id)) out.push(row);
  }

  return out;
}

function buildReorderGroups(rows: AdminCategoryRow[]): CategoryReorderGroup[] {
  const roots = sortByPosition(rows.filter((row) => !row.parent_id));
  const groups: CategoryReorderGroup[] = [
    {
      parentId: null,
      heading: null,
      items: roots,
    },
  ];

  for (const root of roots) {
    const children = sortByPosition(rows.filter((row) => row.parent_id === root.id));
    if (children.length === 0) continue;
    groups.push({
      parentId: root.id,
      heading: root.title,
      items: children,
    });
  }

  return groups;
}

const categoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["active", "inactive"]),
  parent_id: z.string().nullable(),
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
    (category.parent_title?.toLowerCase().includes(q) ?? false) ||
    (category.description?.toLowerCase().includes(q) ?? false)
  );
}

export default function AdminCategories() {
  const { can } = usePermission();
  const canCreate = can(PERMISSIONS.CATEGORIES.CREATE);
  const canUpdate = can(PERMISSIONS.CATEGORIES.UPDATE);
  const canDelete = can(PERMISSIONS.CATEGORIES.DELETE);
  const canReorder =
    can(PERMISSIONS.CATEGORIES.REORDER) || can(PERMISSIONS.CATEGORIES.UPDATE);

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
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [togglingFeaturedIds, setTogglingFeaturedIds] = React.useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

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
      parent_id: null,
      is_featured: false,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    },
  });

  const nameValue = watch("title");
  const parentIdValue = watch("parent_id");
  const isChildForm = Boolean(parentIdValue);

  React.useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugifyCategoryName(nameValue ?? ""));
    }
  }, [nameValue, slugTouched, setValue]);

  React.useEffect(() => {
    if (isChildForm) {
      setValue("is_featured", false);
    }
  }, [isChildForm, setValue]);

  const loadCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const rows = await fetchCategories();
      setCategories(sortHierarchical(rows.map(mapApiCategory)));
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

  const rootOptions = React.useMemo(() => {
    return categories.filter((row) => {
      if (row.parent_id) return false;
      if (editingRowId && row.id === editingRowId) return false;
      return true;
    });
  }, [categories, editingRowId]);

  const enterReorderMode = () => {
    setReorderDraft(sortHierarchical(categories));
    setOrderDirty(false);
    setReorderMode(true);
  };

  const cancelReorderMode = () => {
    setReorderMode(false);
    setOrderDirty(false);
    setReorderDraft([]);
  };

  const applyServerOrder = (rows: AdminCategory[]) => {
    const mapped = sortHierarchical(rows.map(mapApiCategory));
    setCategories(mapped);
    setReorderDraft(mapped);
    setOrderDirty(false);
  };

  const handleGroupReorder = (parentId: string | null, next: AdminCategoryRow[]) => {
    const renumbered = next.map((row, index) => ({
      ...row,
      sort_order: index + 1,
    }));
    const other = reorderDraft.filter((row) =>
      parentId === null ? Boolean(row.parent_id) : row.parent_id !== parentId,
    );
    setReorderDraft(sortHierarchical([...other, ...renumbered]));
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
      const groups = buildReorderGroups(reorderDraft);
      let latest: AdminCategory[] = [];
      for (const group of groups) {
        if (group.items.length === 0) continue;
        latest = await reorderCategories(
          group.items.map((row) => row.id),
          group.parentId,
        );
      }
      applyServerOrder(latest);
      toast.success("Category order saved");
      setReorderMode(false);
      setReorderDraft([]);
    } catch {
      toast.error("Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    const seoDefaults = buildCategorySeoDefaults(data.title, data.slug);
    const parentId = data.parent_id ? Number(data.parent_id) : null;
    const payload = {
      title: data.title,
      slug: data.slug,
      status: data.status,
      parent_id: parentId,
      is_featured: parentId ? false : data.is_featured,
      meta_title: data.meta_title.trim() || seoDefaults.meta_title,
      meta_description: data.meta_description.trim() || seoDefaults.meta_description,
      meta_keywords: data.meta_keywords.trim() || seoDefaults.meta_keywords,
    };

    try {
      if (isEditing && editingCategoryId) {
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
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof (error.response.data as { message?: unknown }).message === "string"
          ? (error.response.data as { message: string }).message
          : "Failed to delete category";
      toast.error(message);
    }
  };

  const toggleFeatured = React.useCallback(
    async (category: AdminCategoryRow, next: boolean) => {
      if (category.parent_id) {
        toast.error("Only top-level categories can be featured");
        return;
      }

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
          parent_id: category.parent_id ? Number(category.parent_id) : null,
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
    },
    [],
  );

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setEditingRowId(null);
    setSlugTouched(false);
    reset({
      title: "",
      slug: "",
      status: "active",
      parent_id: null,
      is_featured: false,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminCategoryRow) => {
    setEditingCategoryId(category.slug);
    setEditingRowId(category.id);
    setSlugTouched(true);
    reset({
      title: category.title,
      slug: category.slug,
      status: category.status,
      parent_id: category.parent_id,
      is_featured: category.is_featured,
      meta_title: category.meta_title ?? "",
      meta_description: category.meta_description ?? "",
      meta_keywords: category.meta_keywords ?? "",
    });
    setIsModalOpen(true);
  };

  const childrenByParent = React.useMemo(() => {
    const map = new Map<string, AdminCategoryRow[]>();
    for (const row of categories) {
      if (!row.parent_id) continue;
      const list = map.get(row.parent_id) ?? [];
      list.push(row);
      map.set(row.parent_id, list);
    }
    for (const [parentId, list] of map) {
      map.set(parentId, sortByPosition(list));
    }
    return map;
  }, [categories]);

  const filteredParents = React.useMemo(() => {
    const roots = sortByPosition(categories.filter((row) => !row.parent_id));

    return roots.filter((parent) => {
      const children = childrenByParent.get(parent.id) ?? [];
      const parentStatusOk =
        statusFilter === "all" || parent.status === statusFilter;
      const childMatchesStatus = children.some(
        (child) => statusFilter === "all" || child.status === statusFilter,
      );

      if (!search.trim()) {
        if (statusFilter === "all") return true;
        return parentStatusOk || childMatchesStatus;
      }

      const parentMatches = matchesSearch(parent, search);
      const childMatches = children.some((child) => matchesSearch(child, search));
      if (!parentMatches && !childMatches) return false;

      if (statusFilter === "all") return true;
      return parentStatusOk || childMatchesStatus;
    });
  }, [categories, childrenByParent, search, statusFilter]);

  React.useEffect(() => {
    if (!search.trim()) return;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const parent of filteredParents) {
        const children = childrenByParent.get(parent.id) ?? [];
        if (children.some((child) => matchesSearch(child, search))) {
          next.add(parent.id);
        }
      }
      return next;
    });
  }, [search, filteredParents, childrenByParent]);

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedParents = filteredParents.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const displayRows = React.useMemo(() => {
    const rows: AdminCategoryRow[] = [];
    for (const parent of pagedParents) {
      rows.push(parent);
      if (!expandedIds.has(parent.id)) continue;

      const children = childrenByParent.get(parent.id) ?? [];
      for (const child of children) {
        if (statusFilter !== "all" && child.status !== statusFilter) continue;
        if (
          search.trim() &&
          !matchesSearch(parent, search) &&
          !matchesSearch(child, search)
        ) {
          continue;
        }
        rows.push(child);
      }
    }
    return rows;
  }, [pagedParents, expandedIds, childrenByParent, statusFilter, search]);

  const toggleExpanded = React.useCallback((parentId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }, []);

  const columns = React.useMemo<DataTableColumn<AdminCategoryRow>[]>(() => {
    const posColumn: DataTableColumn<AdminCategoryRow> = {
      id: "sort_order",
      header: "Pos",
      type: "custom",
      render: (row) => (
        <span className="text-sm tabular-nums text-admin-trend-muted">{row.sort_order}</span>
      ),
      className: "w-14 whitespace-nowrap",
    };

    const titleColumn: DataTableColumn<AdminCategoryRow> = {
      id: "title",
      header: "Category",
      type: "custom",
      render: (row) => {
        if (row.parent_id) {
          return (
            <div className="relative ml-2 flex items-start gap-3 border-l-2 border-zbc-blue/30 py-0.5 pl-4 sm:ml-4 sm:pl-5">
              <div className="min-w-0">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded bg-zbc-blue/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-zbc-blue uppercase">
                    Sub
                  </span>
                  <p className="text-sm font-medium text-admin-heading">{row.title}</p>
                </div>
                <p className="text-xs text-admin-trend-muted">/{row.slug}</p>
              </div>
            </div>
          );
        }

        const childCount = (childrenByParent.get(row.id) ?? []).length;

        return (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-admin-heading">{row.title}</p>
            <p className="text-xs text-admin-trend-muted">
              /{row.slug}
              {childCount > 0
                ? ` · ${childCount} subcategor${childCount === 1 ? "y" : "ies"}`
                : ""}
            </p>
          </div>
        );
      },
      className: "min-w-[200px]",
    };

    const featuredColumn: DataTableColumn<AdminCategoryRow> = {
      id: "is_featured",
      header: "Featured",
      hideOnMobile: true,
      type: "custom",
      render: (row) => {
        if (row.parent_id) {
          return <span className="text-xs text-admin-trend-muted">—</span>;
        }
        const busy = togglingFeaturedIds.has(String(row.id));
        return (
          <AdminToggle
            id={`category-featured-${row.id}`}
            checked={row.is_featured}
            aria-label={`Toggle featured for ${row.title}`}
            className={cn(
              busy && "pointer-events-none opacity-60",
              !canUpdate && "pointer-events-none opacity-50",
            )}
            onCheckedChange={(checked) => {
              if (busy || !canUpdate) return;
              void toggleFeatured(row, checked);
            }}
          />
        );
      },
      className: "whitespace-nowrap",
    };

    const statusColumn: DataTableColumn<AdminCategoryRow> = {
      id: "status",
      header: "Status",
      hideOnMobile: true,
      type: "badge",
      badge: (row) => ({
        variant: row.status,
        label: row.status === "active" ? "Active" : "Inactive",
      }),
      className: "whitespace-nowrap",
    };

    const createdColumn: DataTableColumn<AdminCategoryRow> = {
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
    };

    return [posColumn, titleColumn, featuredColumn, statusColumn, createdColumn];
  }, [togglingFeaturedIds, toggleFeatured, canUpdate, childrenByParent]);

  const table = useCategoriesDataTable({
    data: displayRows,
    columns,
    selectedIds,
    onSelectionChange: setSelectedIds,
    onEdit: openEditModal,
    onDelete: deleteCategory,
  });

  const tableWithPermissions = React.useMemo(() => {
    const hasChildren = (row: AdminCategoryRow) =>
      !row.parent_id && (childrenByParent.get(row.id) ?? []).length > 0;

    const foldUnfoldActions = [
      {
        id: "unfold",
        label: "Unfold category",
        icon: ChevronRight,
        variant: "primary" as const,
        hidden: (row: AdminCategoryRow) =>
          !hasChildren(row) || expandedIds.has(row.id),
        onClick: (row: AdminCategoryRow) => toggleExpanded(row.id),
      },
      {
        id: "fold",
        label: "Fold category",
        icon: ChevronDown,
        variant: "primary" as const,
        hidden: (row: AdminCategoryRow) =>
          !hasChildren(row) || !expandedIds.has(row.id),
        onClick: (row: AdminCategoryRow) => toggleExpanded(row.id),
      },
    ];

    const permissionActions = (table.actions ?? []).filter((action) => {
      if (action.id === "edit") return canUpdate;
      if (action.id === "delete") return canDelete;
      return true;
    });

    return {
      ...table,
      getRowClassName: (row: AdminCategoryRow) =>
        row.parent_id
          ? "bg-zbc-blue/[0.04] hover:bg-zbc-blue/[0.07]"
          : undefined,
      actions: [...foldUnfoldActions, ...permissionActions],
    };
  }, [
    table,
    canUpdate,
    canDelete,
    childrenByParent,
    expandedIds,
    toggleExpanded,
  ]);

  const reorderGroups = React.useMemo(
    () => buildReorderGroups(reorderDraft),
    [reorderDraft],
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Categories"
        description={
          reorderMode
            ? "Reorder main categories and subcategories in separate groups — Cancel discards changes"
            : "Manage categories — expand a row to view its subcategories"
        }
        actions={
          <>
            {reorderMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full sm:w-auto"
                  onClick={cancelReorderMode}
                  disabled={savingOrder}
                >
                  Cancel
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
                {canReorder ? (
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
                ) : null}
                {canCreate ? (
                  <Button
                    type="button"
                    onClick={openCreateModal}
                    className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
                  >
                    <Plus className="size-5" aria-hidden />
                    New Category
                  </Button>
                ) : null}
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
            groups={reorderGroups}
            onGroupReorder={handleGroupReorder}
            onMoveToPosition={(category, position) => {
              void handleMoveToPosition(category, position);
            }}
            disabled={savingOrder}
          />
        ) : (
          <DataTable {...tableWithPermissions} />
        )}
      </AdminPanel>

      {!reorderMode ? (
        <AdminPagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filteredParents.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className={cn(
            "flex max-h-[min(90dvh,100%)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden",
            "border-[#DDD8C8] bg-primary-foreground p-4 sm:w-full sm:p-6",
          )}
          // Select portals to <body>, so option clicks look like "outside" the dialog.
          // On live (faster unmount) a double-click's 2nd click hits the overlay and closes the modal.
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
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
                  Parent category
                </label>
                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? NONE_PARENT}
                      onValueChange={(value) =>
                        field.onChange(value === NONE_PARENT ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Top-level (no parent)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_PARENT}>None — top-level</SelectItem>
                        {rootOptions.map((root) => (
                          <SelectItem key={root.id} value={root.id}>
                            {root.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-admin-trend-muted">
                  Subcategories appear under their parent in the site navigation.
                </p>
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

              {!isChildForm ? (
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
                      Featured parent categories appear next to Home. Each links to /{`{slug}`}.
                    </p>
                  </div>
                </div>
              ) : null}

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
