import * as React from "react";
import { Play, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import {
  fetchScheduledTaskFailures,
  getScheduledTaskApiError,
  rerunScheduledTaskFailure,
  resolveScheduledTaskFailure,
  type ScheduledTaskFailureRow,
} from "@/services/admin/scheduledTasks";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/types/permissions";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "failed", label: "Failed" },
  { value: "rerun_queued", label: "Re-run queued" },
  { value: "resolved", label: "Resolved" },
];

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusBadge(status: string) {
  if (status === "resolved") {
    return <AdminStatusBadge variant="published">Resolved</AdminStatusBadge>;
  }
  if (status === "rerun_queued") {
    return <AdminStatusBadge variant="pending_review">Re-run queued</AdminStatusBadge>;
  }
  return <AdminStatusBadge variant="archived">Failed</AdminStatusBadge>;
}

export default function AdminScheduledTasks() {
  const { can } = usePermission();
  const canRerun = can(PERMISSIONS.SCHEDULED_TASKS.RERUN);

  const [items, setItems] = React.useState<ScheduledTaskFailureRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("failed");
  const [search, setSearch] = React.useState("");
  const [actionId, setActionId] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchScheduledTaskFailures({
        status: status === "all" ? undefined : status,
      });
      setItems(data.items ?? []);
    } catch (error) {
      toast.error(getScheduledTaskApiError(error, "Failed to load scheduled task failures"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        row.task_name.toLowerCase().includes(q) ||
        row.task_key.toLowerCase().includes(q) ||
        row.exception_message.toLowerCase().includes(q),
    );
  }, [items, search]);

  const openCount = items.filter((row) => row.status !== "resolved").length;

  async function handleRerun(row: ScheduledTaskFailureRow) {
    const confirmed = window.confirm(`Re-run "${row.task_name}" now?`);
    if (!confirmed) return;

    setActionId(row.id);
    try {
      await rerunScheduledTaskFailure(row.id);
      toast.success("Task re-run completed.");
      await load();
    } catch (error) {
      toast.error(getScheduledTaskApiError(error, "Failed to re-run task"));
      await load();
    } finally {
      setActionId(null);
    }
  }

  async function handleResolve(row: ScheduledTaskFailureRow) {
    const confirmed = window.confirm(`Mark "${row.task_name}" as resolved without re-running?`);
    if (!confirmed) return;

    setActionId(row.id);
    try {
      await resolveScheduledTaskFailure(row.id);
      toast.success("Marked as resolved.");
      await load();
    } catch (error) {
      toast.error(getScheduledTaskApiError(error, "Failed to resolve"));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Scheduled tasks"
        description="Review failed scheduler tasks and queue jobs, then re-run them from the admin panel"
        actions={
          <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminPanel className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-trend-muted">
            Loaded rows
          </p>
          <p className="mt-1 text-2xl font-semibold text-admin-ink">{items.length}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-trend-muted">
            Open in this view
          </p>
          <p className="mt-1 text-2xl font-semibold text-admin-ink">{openCount}</p>
        </AdminPanel>
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search task or error…"
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
      />

      <AdminPanel className="overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-admin-border bg-admin-surface-muted/40 text-xs uppercase tracking-wide text-admin-trend-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Error</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Failed</th>
              <th className="px-4 py-3 font-medium">Count</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-admin-trend-muted">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-admin-trend-muted">
                  No failed tasks found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-admin-border/70 align-top">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-admin-ink">{row.task_name}</p>
                      <span className="rounded border border-admin-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-admin-trend-muted">
                        {row.task_type === "queue" ? "Queue job" : "Scheduler"}
                      </span>
                    </div>
                    <p className="text-xs text-admin-trend-muted">{row.task_key}</p>
                  </td>
                  <td className="max-w-md px-4 py-3 text-admin-ink/90">
                    <p className="line-clamp-3 whitespace-pre-wrap">{row.exception_message}</p>
                  </td>
                  <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-admin-trend-muted">
                    {formatDate(row.failed_at)}
                  </td>
                  <td className="px-4 py-3">{row.occurrence_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {canRerun && row.can_rerun && row.status !== "resolved" ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={actionId === row.id}
                          onClick={() => void handleRerun(row)}
                        >
                          <Play className="mr-1 size-3.5" />
                          {actionId === row.id ? "Running…" : "Run again"}
                        </Button>
                      ) : null}
                      {canRerun && row.status !== "resolved" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actionId === row.id}
                          onClick={() => void handleResolve(row)}
                        >
                          <CheckCircle2 className="mr-1 size-3.5" />
                          Resolve
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminPanel>
    </div>
  );
}
