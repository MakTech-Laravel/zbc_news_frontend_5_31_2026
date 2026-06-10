import { Edit2, History, Trash2 } from "lucide-react";
import * as React from "react";

import type { DataTableProps } from "@/components/ui/data-table/types";
import type { DataTableColumn } from "@/components/ui/data-table/types";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  roles: string[];
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
  onActivityLog: (row: AdminUserRow) => void;
  onDelete: (row: AdminUserRow) => void;
};

export function useUsersDataTable({
  data,
  columns,
  onEdit,
  onActivityLog,
  onDelete,
}: Options): DataTableProps<AdminUserRow> {
  const actions = React.useMemo(
    () => [
      {
        id: "edit",
        label: "Edit user",
        icon: Edit2,
        variant: "primary" as const,
        onClick: onEdit,
      },
      {
        id: "activity-log",
        label: "View article activity log",
        icon: History,
        variant: "muted" as const,
        onClick: onActivityLog,
      },
      {
        id: "delete",
        label: "Delete user",
        icon: Trash2,
        variant: "destructive" as const,
        onClick: onDelete,
      },
    ],
    [onEdit, onActivityLog, onDelete],
  );

  return {
    data,
    getRowId: (row) => row.id,
    columns,
    emptyMessage: "No users found.",
    minWidth: 720,
    actions,
    actionsColumnHeader: "Actions",
  };
}
