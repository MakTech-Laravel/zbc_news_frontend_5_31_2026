import { Edit2, Trash2 } from "lucide-react";

import type { DataTableProps } from "@/components/ui/data-table/types";
import type { DataTableColumn } from "@/components/ui/data-table/types";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  joined: string;
  avatarUrl?: string | null;
};

type Options = {
  data: AdminUserRow[];
  columns: DataTableColumn<AdminUserRow>[];
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onEdit: (row: AdminUserRow) => void;
  onDelete: (row: AdminUserRow) => void;
};

export function useUsersDataTable({
  data,
  columns,
  onEdit,
  onDelete,
}: Options): DataTableProps<AdminUserRow> {
  return {
    data,
    getRowId: (row) => row.id,
    columns,
    emptyMessage: "No users found.",
    minWidth: 720,
    actions: [
      {
        id: "edit",
        label: "Edit user",
        icon: Edit2,
        variant: "primary",
        onClick: onEdit,
      },
      {
        id: "delete",
        label: "Delete user",
        icon: Trash2,
        variant: "destructive",
        onClick: onDelete,
      },
    ],
    actionsColumnHeader: "Actions",
  };
}
