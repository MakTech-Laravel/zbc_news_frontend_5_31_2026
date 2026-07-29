import * as React from "react";
import toast from "react-hot-toast";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import {
  fetchAdminAccessibilityReports,
  updateAccessibilityReportStatus,
  type AccessibilityReport,
  type AccessibilityReportStatus,
} from "@/services/admin/accessibilityReports";
import { PERMISSIONS } from "@/types/permissions";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
];

function statusVariant(status: AccessibilityReport["status"]) {
  switch (status) {
    case "new":
      return "pending_review" as const;
    case "reviewed":
      return "draft" as const;
    case "resolved":
      return "published" as const;
    default:
      return "pending_review" as const;
  }
}

export default function AdminAccessibilityReports() {
  const { can } = usePermission();
  const canUpdate = can(PERMISSIONS.ACCESSIBILITY_REPORTS.UPDATE);

  const [reports, setReports] = React.useState<AccessibilityReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAccessibilityReports({
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
        page,
      });
      setReports(data.reports);
      setMeta(data.meta);
    } catch {
      toast.error("Failed to load accessibility reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => {
    void loadReports();
  }, [loadReports]);

  async function handleStatusUpdate(id: string, nextStatus: AccessibilityReportStatus) {
    if (!canUpdate) return;
    try {
      await updateAccessibilityReportStatus(id, nextStatus);
      toast.success("Report status updated.");
      await loadReports();
    } catch {
      toast.error("Unable to update report status.");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Report"
        description="Accessibility issue reports submitted from the Accessibility Statement page"
      />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by issue, page URL, or email…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
        showCategoryFilter={false}
      />

      <AdminPanel>
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-admin-label">Loading reports…</p>
        ) : reports.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-admin-label">No reports found.</p>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((report) => (
              <article key={report.id} className="space-y-3 px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusBadge variant={statusVariant(report.status)}>
                        {report.statusLabel}
                      </AdminStatusBadge>
                      <span className="text-xs text-admin-label">{report.submittedAtLabel}</span>
                    </div>
                    {report.email ? <p className="text-xs text-admin-label">{report.email}</p> : null}
                    {report.pageUrl ? (
                      <p className="text-xs text-admin-label break-all">{report.pageUrl}</p>
                    ) : null}
                  </div>
                  {canUpdate ? (
                    <select
                      className="h-9 rounded-lg border border-admin-input-border bg-white px-3 text-sm"
                      value={report.status}
                      onChange={(event) =>
                        void handleStatusUpdate(
                          report.id,
                          event.target.value as AccessibilityReportStatus,
                        )
                      }
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  ) : (
                    <Button type="button" size="sm" variant="outline" disabled>
                      Read only
                    </Button>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-admin-label">{report.issue}</p>
              </article>
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPagination
        page={meta.current_page}
        totalPages={meta.last_page}
        totalItems={meta.total}
        pageSize={meta.per_page}
        onPageChange={setPage}
      />
    </div>
  );
}
