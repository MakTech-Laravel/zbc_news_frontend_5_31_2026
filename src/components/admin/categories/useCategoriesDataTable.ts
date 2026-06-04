import { Edit2, Trash2 } from "lucide-react";

import type { DataTableColumn, DataTableProps } from "@/components/ui/data-table/types";

export type AdminCategoryStatus = "active" | "inactive";

export type AdminCategoryRow = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: AdminCategoryStatus;
  articleCount: number;
  created_at: string;
  updated_at: string;
};

type Options = {
  data: AdminCategoryRow[];
  columns: DataTableColumn<AdminCategoryRow>[];
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onEdit: (row: AdminCategoryRow) => void;
  onDelete: (row: AdminCategoryRow) => void;
};

export function useCategoriesDataTable({
  data,
  columns,
  onEdit,
  onDelete,
}: Options): DataTableProps<AdminCategoryRow> {
  return {
    data,
    getRowId: (row) => row.id,
    columns,
    emptyMessage: "No categories found.",
    minWidth: 720,
    actions: [
      {
        id: "edit",
        label: "Edit category",
        icon: Edit2,
        variant: "primary",
        onClick: onEdit,
      },
      {
        id: "delete",
        label: "Delete category",
        icon: Trash2,
        variant: "destructive",
        onClick: onDelete,
      },
    ],
    actionsColumnHeader: "Actions",
  };
}
