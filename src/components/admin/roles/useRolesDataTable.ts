import { Edit2, Trash2 } from "lucide-react";

import type { DataTableColumn, DataTableProps } from "@/components/ui/data-table/types";

type Options<T extends { id: number; is_protected?: boolean }> = {
  data: T[];
  columns: DataTableColumn<T>[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
};

export function useRolesDataTable<T extends { id: number; is_protected?: boolean }>({
  data,
  columns,
  onEdit,
  onDelete,
}: Options<T>): DataTableProps<T> {
  return {
    data,
    getRowId: (row) => String(row.id),
    columns,
    emptyMessage: "No roles found.",
    minWidth: 720,
    actions: [
      {
        id: "edit",
        label: "Edit role",
        icon: Edit2,
        variant: "primary",
        onClick: onEdit,
      },
      {
        id: "delete",
        label: "Delete role",
        icon: Trash2,
        variant: "destructive",
        hidden: (row) => Boolean(row.is_protected),
        onClick: onDelete,
      },
    ],
    actionsColumnHeader: "Action",
  };
}
