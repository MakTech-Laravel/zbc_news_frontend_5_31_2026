import * as React from "react";

import { DATA_TABLE_DEFAULTS } from "@/components/ui/data-table/defaults";
import type {
  DataTableProps,
  DataTableSelection,
  UseDataTableOptions,
} from "@/components/ui/data-table/types";

export type UseDataTableReturn<T> = DataTableProps<T>;

export function useDataTable<T>(options: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const {
    data,
    getRowId,
    columns,
    actions,
    actionsColumnHeader = DATA_TABLE_DEFAULTS.actionsColumnHeader,
    selectable = DATA_TABLE_DEFAULTS.selectable,
    emptyMessage = DATA_TABLE_DEFAULTS.emptyMessage,
    minWidth = DATA_TABLE_DEFAULTS.minWidth,
    selectedIds: controlledSelectedIds,
    onSelectionChange,
  } = options;

  const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(
    () => new Set(),
  );

  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled ? controlledSelectedIds : internalSelectedIds;

  const setSelectedIds = React.useCallback(
    (next: Set<string>) => {
      if (isControlled) {
        onSelectionChange?.(next);
      } else {
        setInternalSelectedIds(next);
        onSelectionChange?.(next);
      }
    },
    [isControlled, onSelectionChange],
  );

  const rowIds = React.useMemo(
    () => data.map((row) => getRowId(row)),
    [data, getRowId],
  );

  const allSelected = data.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = rowIds.some((id) => selectedIds.has(id)) && !allSelected;

  const toggleAll = React.useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(rowIds));
  }, [allSelected, rowIds, setSelectedIds]);

  const toggleOne = React.useCallback(
    (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedIds(next);
    },
    [selectedIds, setSelectedIds],
  );

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, [setSelectedIds]);

  const selection: DataTableSelection = {
    selectedIds,
    allSelected,
    someSelected,
    toggleAll,
    toggleOne,
    clearSelection,
  };

  return {
    data,
    getRowId,
    columns,
    actions,
    actionsColumnHeader,
    selectable,
    emptyMessage,
    minWidth,
    selection,
  };
}
