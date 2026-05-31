import type { DataTableAction, DataTableActionVariant } from "@/components/ui/data-table/types";
import { cn } from "@/lib/utils";

const ACTION_STYLES: Record<DataTableActionVariant, string> = {
  primary: "text-admin-chart-blue hover:bg-admin-metric-blue-bg",
  destructive: "text-destructive hover:bg-destructive/10",
  muted: "text-admin-trend-muted hover:bg-muted",
};

type DataTableActionsProps<T> = {
  row: T;
  actions: DataTableAction<T>[];
};

export function DataTableActions<T>({ row, actions }: DataTableActionsProps<T>) {
  const visible = actions.filter((action) => !action.hidden?.(row));
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {visible.map((action) => {
        const Icon = action.icon;
        const variant = action.variant ?? "muted";

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => action.onClick(row)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded",
              ACTION_STYLES[variant],
            )}
            aria-label={action.label}
          >
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
}
