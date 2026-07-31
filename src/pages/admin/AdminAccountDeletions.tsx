import * as React from "react";
import { RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import {
  fetchPendingAccountDeletions,
  getAdminUserApiError,
  restoreAdminUserDeletion,
} from "@/services/admin/users";
import type { AdminUserRow } from "@/components/admin/users/useUsersDataTable";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "cancel_requested", label: "Cancel requested" },
  { value: "pending_deletion", label: "Pending deletion" },
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

function statusBadge(user: AdminUserRow) {
  if (user.hasDeletionCancelRequest || user.status === "cancel_requested") {
    return (
      <AdminStatusBadge variant="pending_review">Cancel requested</AdminStatusBadge>
    );
  }
  return <AdminStatusBadge variant="archived">Pending deletion</AdminStatusBadge>;
}

export default function AdminAccountDeletions() {
  const [users, setUsers] = React.useState<AdminUserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [actionId, setActionId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingAccountDeletions();
      setUsers(data);
    } catch (error) {
      toast.error(getAdminUserApiError(error, "Failed to load deletion requests"));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const isCancel =
        user.hasDeletionCancelRequest || user.status === "cancel_requested";
      if (status === "cancel_requested" && !isCancel) return false;
      if (status === "pending_deletion" && isCancel) return false;
      if (!q) return true;
      return (
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      );
    });
  }, [users, status, search]);

  const cancelRequestedCount = users.filter(
    (u) => u.hasDeletionCancelRequest || u.status === "cancel_requested",
  ).length;
  const pendingOnlyCount = users.length - cancelRequestedCount;

  async function handleRestore(user: AdminUserRow) {
    const confirmed = window.confirm(
      user.hasDeletionCancelRequest
        ? `Approve cancellation and restore "${user.name}"? They will be able to sign in again.`
        : `Restore "${user.name}" without a cancel request? They will be able to sign in again.`,
    );
    if (!confirmed) return;

    setActionId(user.id);
    try {
      await restoreAdminUserDeletion(user.id);
      toast.success("Account restored. User can sign in again.");
      await load();
    } catch (error) {
      toast.error(getAdminUserApiError(error, "Failed to restore account"));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Account deletions"
        description="Review soft-deleted accounts, cancel requests, and restore users during the grace period"
        actions={
          <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminPanel className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-trend-muted">
            Total in grace
          </p>
          <p className="mt-1 text-2xl font-semibold text-admin-heading">{users.length}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-trend-muted">
            Cancel requested
          </p>
          <p className="mt-1 text-2xl font-semibold text-admin-heading">{cancelRequestedCount}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-admin-trend-muted">
            Awaiting cancel
          </p>
          <p className="mt-1 text-2xl font-semibold text-admin-heading">{pendingOnlyCount}</p>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email…"
          statusValue={status}
          onStatusChange={setStatus}
          statusOptions={STATUS_OPTIONS}
        />
      </AdminPanel>

      <AdminPanel className="overflow-auto p-0">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-admin-trend-muted">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Cancel request</th>
              <th className="px-4 py-3 font-medium">Permanent delete on</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-admin-trend-muted">
                  Loading deletion requests…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-admin-trend-muted">
                  No account deletion requests in this filter.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <div className="font-medium text-admin-heading">{user.name}</div>
                    <div className="text-xs text-admin-trend-muted">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(user)}</td>
                  <td className="px-4 py-3 text-admin-trend-muted">
                    {formatDate(user.deletionRequestedAt)}
                  </td>
                  <td className="px-4 py-3 text-admin-trend-muted">
                    {user.hasDeletionCancelRequest
                      ? formatDate(user.deletionCancelRequestedAt) || "Yes — review needed"
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-admin-trend-muted">
                    {user.hasDeletionCancelRequest
                      ? "Paused (cancel pending)"
                      : formatDate(user.scheduledPermanentDeletionAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={actionId === user.id}
                      onClick={() => void handleRestore(user)}
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      {actionId === user.id ? "Restoring…" : "Restore"}
                    </Button>
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
