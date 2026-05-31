import * as React from "react";

import { DataTableActions } from "@/components/ui/data-table/DataTableActions";
import { DataTableCell } from "@/components/ui/data-table/DataTableCell";
import type { DataTableProps } from "@/components/ui/data-table/types";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function useIsMobile(breakpoint = 992) {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function splitColumnsForViewport<T>(
  columns: DataTableProps<T>["columns"],
  isMobile: boolean,
) {
  if (!isMobile) {
    return { visible: columns, drawer: [] as DataTableProps<T>["columns"] };
  }

  const hasHideFlags = columns.some((column) => column.hideOnMobile);

  if (hasHideFlags) {
    return {
      visible: columns.filter((column) => !column.hideOnMobile),
      drawer: columns.filter((column) => column.hideOnMobile),
    };
  }

  return {
    visible: columns.slice(0, 1),
    drawer: columns.slice(1),
  };
}

export function DataTable<T>({
  data,
  getRowId,
  columns,
  actions,
  actionsColumnHeader,
  emptyMessage,
  minWidth,
  className,
}: DataTableProps<T> & { className?: string }) {
  const isMobile = useIsMobile();
  const [openRows, setOpenRows] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    setOpenRows(new Set());
  }, [data]);

  const showActions = actions && actions.length > 0;
  const { visible: visibleColumns, drawer: drawerColumns } = splitColumnsForViewport(
    columns,
    isMobile,
  );
  const hasMobileDrawer = isMobile && (drawerColumns.length > 0 || showActions);

  const totalCols =
    visibleColumns.length + (hasMobileDrawer ? 1 : 0) + (!isMobile && showActions ? 1 : 0);

  function toggleRow(id: string) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div
      className={cn(
        "overflow-x-auto",
        !isMobile && data.length > 0 && "",
        className,
      )}
    >
      <table
        className="w-full border-collapse text-left"
        style={{ minWidth: isMobile ? undefined : minWidth }}
      >
        <thead className={cn(!isMobile && "sticky top-0 z-10")}>
          <tr className="border-b border-border bg-admin-table-header-bg">
            {visibleColumns.map((column) => (
              <th
                key={column.id}
                className={cn(
                  "px-3 py-3 text-xs font-medium uppercase tracking-wider text-admin-trend-muted sm:px-4",
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}

            {showActions && !isMobile && (
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-admin-trend-muted sm:px-6">
                {actionsColumnHeader}
              </th>
            )}

            {hasMobileDrawer && <th className="w-10 px-2 py-3 sm:px-3" />}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const rowId = getRowId(row);
            const isOpen = openRows.has(rowId);

            return (
              <React.Fragment key={rowId}>
                <tr className="border-b border-border last:border-b-0 hover:bg-admin-surface/80">
                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-2 py-3 align-middle sm:px-4 sm:py-4",
                        column.className,
                      )}
                    >
                      <DataTableCell column={column} row={row} />
                    </td>
                  ))}

                  {showActions && !isMobile && (
                    <td className="px-4 py-4 align-middle sm:px-6">
                      <DataTableActions row={row} actions={actions} />
                    </td>
                  )}

                  {hasMobileDrawer && (
                    <td className="w-10 px-2 py-3 align-middle sm:px-3 sm:py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => toggleRow(rowId)}
                          aria-label={isOpen ? "Collapse row" : "Expand row"}
                          aria-expanded={isOpen}
                          className={cn(
                            "inline-flex size-7 items-center justify-center rounded border border-border",
                            "text-admin-trend-muted transition-colors hover:bg-admin-surface hover:text-admin-heading",
                            isOpen && "border-primary/30 bg-admin-surface text-admin-heading",
                          )}
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform duration-200",
                              isOpen && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>

                {hasMobileDrawer && (
                  <tr>
                    <td colSpan={totalCols} className="p-0">
                      <div
                        className={cn(
                          "grid transition-all duration-200 ease-in-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div
                            className={cn(
                              "border-b border-border bg-admin-surface/50 px-3 py-3 sm:px-4",
                              !isOpen && "border-b-0",
                            )}
                          >
                            {drawerColumns.length > 0 && (
                              <div className="mb-3 space-y-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-trend-muted">
                                  More details
                                </p>
                                {drawerColumns.map((column) => (
                                  <div key={column.id} className="flex items-start gap-3">
                                    <span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wider text-admin-trend-muted sm:w-24">
                                      {column.header}
                                    </span>
                                    <div className="min-w-0 text-sm text-admin-heading">
                                      <DataTableCell column={column} row={row} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {showActions && (
                              <div
                                className={cn(
                                  "flex flex-wrap items-center gap-2",
                                  drawerColumns.length > 0 && "border-t border-border pt-3",
                                )}
                              >
                                <p className="w-full text-[10px] font-semibold uppercase tracking-widest text-admin-trend-muted sm:w-auto">
                                  Actions
                                </p>
                                <DataTableActions row={row} actions={actions} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <p className="px-4 py-12 text-center text-sm text-admin-label sm:px-6">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}
