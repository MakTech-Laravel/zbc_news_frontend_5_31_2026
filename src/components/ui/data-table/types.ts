import type { LucideIcon } from "lucide-react";

// ─── Badge ────────────────────────────────────────────────────────────────────

export type DataTableBadgeValue = {
  variant: string;
  label?: string;
};

// ─── Action ───────────────────────────────────────────────────────────────────

export type DataTableActionVariant = "primary" | "destructive" | "muted";

export type DataTableAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: DataTableActionVariant;
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
};

// ─── Column ───────────────────────────────────────────────────────────────────

export type DataTableColumn<T> = {
  id: string;
  header: string;
  headerClassName?: string;
  className?: string;

  /**
   * When true, this column is always shown on desktop (≥ 992 px) and moved into
   * the per-row expand drawer on smaller viewports. Default: false (always visible).
   */
  hideOnMobile?: boolean;

  // Render strategies (pick one per column)
  type?:
    | "text"
    | "stack"
    | "badge"
    | "avatar"
    | "avatarStack"
    | "iconText"
    | "custom";

  // "text" — plain accessor
  accessor?: (row: T) => string | number | null | undefined;

  // "stack" — primary + optional secondary line
  primary?: (row: T) => string | number;
  secondary?: (row: T) => string | number;

  // "badge"
  badge?: (row: T) => DataTableBadgeValue | null | undefined;

  // "avatar"
  avatar?: {
    src?: (row: T) => string | null | undefined;
    fallback?: (row: T) => string;
    alt?: (row: T) => string;
  };

  // "avatarStack" — avatar + primary + optional secondary
  avatarStack?: {
    src?: (row: T) => string | null | undefined;
    fallback?: (row: T) => string;
    alt?: (row: T) => string;
    primary: (row: T) => string;
    secondary?: (row: T) => string;
  };

  // "iconText"
  icon?: LucideIcon;
  iconText?: (row: T) => string;

  // "custom"
  render?: (row: T) => React.ReactNode;
};

export type DataTableCellType = NonNullable<DataTableColumn<unknown>["type"]>;

// ─── Table ────────────────────────────────────────────────────────────────────

export type DataTableSelection = {
  selectedIds: Set<string>;
  allSelected: boolean;
  someSelected: boolean;
  toggleAll: () => void;
  toggleOne: (id: string) => void;
  clearSelection: () => void;
};

export type DataTableDefaults = {
  emptyMessage: string;
  actionsColumnHeader: string;
  minWidth: number | string;
  selectable: boolean;
};

export type UseDataTableOptions<T> = {
  data: T[];
  getRowId: (row: T) => string;
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  actionsColumnHeader?: string;
  selectable?: boolean;
  emptyMessage?: string;
  minWidth?: number | string;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
};

export type DataTableProps<T> = {
  data: T[];
  getRowId: (row: T) => string;
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  actionsColumnHeader?: string;
  selectable?: boolean;
  selection?: DataTableSelection;
  emptyMessage?: string;
  minWidth?: number | string;
};