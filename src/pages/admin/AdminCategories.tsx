import * as React from "react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/data/admin/mockCategories";
import {
  createCategoryId,
  deleteAdminCategory,
  loadAdminCategories,
  slugifyCategoryName,
  upsertAdminCategory,
} from "@/data/admin/categoryStore";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const ADMIN_CATEGORY_TABLE_COLUMNS: DataTableColumn<AdminCategoryRow>[] = [
  {
    id: "name",
    header: "Category",
    type: "stack",
    primary: (row) => row.name,
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
    id: "createdAt",
    header: "Created",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => row.createdAt,
    className: "whitespace-nowrap text-admin-trend-muted",
  },
];

type CategoryFormState = {
  name: string;
  slug: string;
  status: AdminCategoryStatus;
};

const EMPTY_CATEGORY_FORM: CategoryFormState = {
  name: "",
  slug: "",
  status: "active",
};

function matchesSearch(category: AdminCategoryRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    category.name.toLowerCase().includes(q) ||
    category.slug.toLowerCase().includes(q) ||
    (category.description?.toLowerCase().includes(q) ?? false)
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = React.useState<AdminCategoryRow[]>(() =>
    loadAdminCategories(),
  );
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState(EMPTY_CATEGORY_FORM);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(false);

  const isEditing = editingCategoryId !== null;

  const refreshCategories = React.useCallback(() => {
    setCategories(loadAdminCategories());
  }, []);

  React.useEffect(() => {
    const onFocus = () => refreshCategories();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshCategories]);

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setDeleteError(null);
    setSlugTouched(false);
    setFormData({ ...EMPTY_CATEGORY_FORM });
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminCategoryRow) => {
    setEditingCategoryId(category.id);
    setDeleteError(null);
    setSlugTouched(true);
    setFormData({
      name: category.name,
      slug: category.slug,
      status: category.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (category: AdminCategoryRow) => {
    const result = deleteAdminCategory(category.id);
    if (!result.ok) {
      setDeleteError(result.reason);
      return;
    }
    setDeleteError(null);
    refreshCategories();
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

  const table = useCategoriesDataTable({
    data: paged,
    columns: ADMIN_CATEGORY_TABLE_COLUMNS,
    selectedIds,
    onSelectionChange: setSelectedIds,
    onEdit: openEditModal,
    onDelete: handleDelete,
  });

  const handleSave = () => {
    const name = formData.name.trim();
    const slug = (formData.slug.trim() || slugifyCategoryName(name)).toLowerCase();
    if (!name || !slug) return;

    upsertAdminCategory({
      id: editingCategoryId ?? createCategoryId(),
      name,
      slug,
      status: formData.status,
    });

    refreshCategories();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage news categories"
        actionLabel="New Category"
        onAction={openCreateModal}
      />

      {deleteError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {deleteError}
        </p>
      ) : null}

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
        <DataTable {...table} />
      </AdminPanel>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setDeleteError(null);
        }}
      >
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

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-1">
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="category-name"
                    className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                  >
                    Name
                  </label>
                  <Input
                    id="category-name"
                    type="text"
                    placeholder="Category name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        slug: slugTouched ? prev.slug : slugifyCategoryName(name),
                      }));
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-slug"
                    className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                  >
                    Slug
                  </label>
                  <Input
                    id="category-slug"
                    type="text"
                    placeholder="category-slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setFormData({ ...formData, slug: e.target.value });
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as AdminCategoryStatus,
                      })
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
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full sm:w-auto"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-10 w-full sm:w-auto"
                    disabled={!formData.name.trim()}
                    onClick={handleSave}
                  >
                    {isEditing ? "Save" : "Create"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
