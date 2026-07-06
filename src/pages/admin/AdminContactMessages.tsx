import * as React from "react";
import { Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import {
  bulkContactMessageAction,
  exportContactMessages,
  fetchAdminContactMessages,
  type ContactInquiry,
} from "@/services/admin/contactMessages";
import { PERMISSIONS } from "@/types/permissions";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const BULK_ACTIONS = [
  { value: "mark_read", label: "Mark as Read" },
  { value: "mark_unread", label: "Mark as Unread" },
  { value: "mark_replied", label: "Mark as Replied" },
  { value: "archive", label: "Archive" },
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Delete" },
] as const;

function statusVariant(status: ContactInquiry["status"]) {
  switch (status) {
    case "new":
      return "pending_review" as const;
    case "read":
      return "draft" as const;
    case "replied":
      return "published" as const;
    case "archived":
      return "archived" as const;
    default:
      return "pending_review" as const;
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminContactMessages() {
  const { can } = usePermission();
  const [messages, setMessages] = React.useState<ContactInquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState<"csv" | "excel" | null>(null);
  const [status, setStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = React.useState<(typeof BULK_ACTIONS)[number]["value"]>("mark_read");
  const [meta, setMeta] = React.useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const canBulk = can(PERMISSIONS.CONTACT_INQUIRIES.BULK);
  const canExport = can(PERMISSIONS.CONTACT_INQUIRIES.EXPORT);
  const canDelete = can(PERMISSIONS.CONTACT_INQUIRIES.DELETE);

  const loadMessages = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminContactMessages({
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
        page,
      });
      setMessages(data.messages);
      setMeta(data.meta);
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to load contact messages.");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(messages.map((message) => message.id)));
  }

  async function handleBulkAction() {
    if (!canBulk || selectedIds.size === 0) return;
    if (bulkAction === "delete" && !window.confirm("Delete selected contact messages?")) return;

    try {
      await bulkContactMessageAction(bulkAction, Array.from(selectedIds));
      toast.success("Bulk action completed.");
      await loadMessages();
    } catch {
      toast.error("Unable to complete bulk action.");
    }
  }

  async function handleExport(format: "csv" | "excel") {
    if (!canExport) return;
    setExporting(format);
    try {
      const blob = await exportContactMessages(format, {
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
      });
      const extension = format === "csv" ? "csv" : "xls";
      downloadBlob(blob, `contact-messages.${extension}`);
      toast.success(`Exported contact messages as ${format.toUpperCase()}.`);
    } catch {
      toast.error("Unable to export contact messages.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact Messages"
        description="Review and respond to visitor inquiries from the contact page"
      />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, subject, or message…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
        showCategoryFilter={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {canBulk ? (
            <>
              <label className="flex items-center gap-2 text-sm text-admin-label">
                <input
                  type="checkbox"
                  className="size-4 rounded border-admin-input-border"
                  checked={messages.length > 0 && selectedIds.size === messages.length}
                  onChange={toggleSelectAll}
                />
                Select all
              </label>
              <select
                className="h-9 rounded-lg border border-admin-input-border bg-white px-3 text-sm"
                value={bulkAction}
                onChange={(event) =>
                  setBulkAction(event.target.value as (typeof BULK_ACTIONS)[number]["value"])
                }
              >
                {BULK_ACTIONS.filter((action) => action.value !== "delete" || canDelete).map(
                  (action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ),
                )}
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={selectedIds.size === 0}
                onClick={() => void handleBulkAction()}
              >
                Apply
              </Button>
            </>
          ) : null}
        </div>

        {canExport ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={exporting !== null}
              onClick={() => void handleExport("csv")}
            >
              <Download className="size-4" />
              {exporting === "csv" ? "Exporting…" : "Export CSV"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={exporting !== null}
              onClick={() => void handleExport("excel")}
            >
              <Download className="size-4" />
              {exporting === "excel" ? "Exporting…" : "Export Excel"}
            </Button>
          </div>
        ) : null}
      </div>

      <AdminPanel>
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-admin-label">Loading contact messages…</p>
        ) : messages.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-admin-label">No contact messages found.</p>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message) => (
              <article key={message.id} className="space-y-3 px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {canBulk ? (
                      <input
                        type="checkbox"
                        className="mt-1 size-4 rounded border-admin-input-border"
                        checked={selectedIds.has(message.id)}
                        onChange={() => toggleSelected(message.id)}
                      />
                    ) : null}
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-admin-heading">{message.name}</p>
                        <AdminStatusBadge variant={statusVariant(message.status)}>
                          {message.statusLabel}
                        </AdminStatusBadge>
                        <span className="text-xs text-admin-label">{message.submittedAtLabel}</span>
                      </div>
                      <p className="text-xs text-admin-label">{message.email}</p>
                      {message.subject ? (
                        <p className="text-sm font-medium text-admin-heading">{message.subject}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 rounded-lg px-3"
                      asChild
                    >
                      <Link to={`/admin/contact-messages/${message.id}`}>
                        <Eye className="size-4" aria-hidden />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-admin-label">
                  {message.messagePreview ?? message.message}
                </p>
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
