import type { ReactNode } from "react";

import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";
import { cn } from "@/lib/utils";

export type ActivityLogRowBase = {
  id: string;
  action: string;
  performedBy: string;
  description: string;
  createdAt: string;
  createdAtIso: string;
};

type ActivityLogTableProps<T extends ActivityLogRowBase> = {
  logs: T[];
  className?: string;
  renderExtra?: (log: T) => ReactNode;
};

function actionBadgeVariant(action: string): AdminBadgeVariant {
  const value = action.toLowerCase();

  if (value.includes("publish")) return "published";
  if (value.includes("create")) return "draft";
  if (value.includes("delete") || value.includes("archive")) return "archived";
  if (value.includes("schedule")) return "scheduled";
  if (value.includes("review") || value.includes("update")) return "pending_review";

  return "pending_review";
}

export function ActivityLogTable<T extends ActivityLogRowBase>({
  logs,
  className,
  renderExtra,
}: ActivityLogTableProps<T>) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {logs.map((log) => (
        <article key={log.id} className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <AdminStatusBadge variant={actionBadgeVariant(log.action)}>
                {log.action}
              </AdminStatusBadge>
              <p className="text-base font-semibold text-admin-heading">{log.description}</p>
              <p className="text-sm text-admin-label">
                Performed by{" "}
                <span className="font-medium text-admin-heading">{log.performedBy}</span>
              </p>
            </div>
            <time
              dateTime={log.createdAtIso}
              className="shrink-0 text-sm text-admin-trend-muted"
            >
              {log.createdAt}
            </time>
          </div>

          {renderExtra ? <div className="mt-4">{renderExtra(log)}</div> : null}
        </article>
      ))}
    </div>
  );
}
