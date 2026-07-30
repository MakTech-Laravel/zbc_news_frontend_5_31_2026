import * as React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Radio } from "lucide-react";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import { ARTICLE_STATUS_FILTER_OPTIONS } from "@/data/admin/mockArticles";
import { ARTICLE_STATUS_LABELS } from "@/data/admin/articleWorkflow";
import {
  deleteLiveUpdate,
  fetchLiveUpdates,
  type LiveUpdateShell,
} from "@/services/admin/liveUpdates";
import { matchesArticleSearch } from "@/services/admin/articles";

const PAGE_SIZE = 10;

function formatWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export default function AdminLiveUpdates() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<LiveUpdateShell[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setItems(await fetchLiveUpdates());
    } catch {
      toast.error("Failed to load live updates");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return matchesArticleSearch(item, search);
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleDelete = async (item: LiveUpdateShell) => {
    if (!window.confirm(`Delete live update “${item.title}”?`)) return;
    try {
      await deleteLiveUpdate(item.slug);
      toast.success("Live update deleted");
      await load();
    } catch {
      toast.error("Failed to delete live update");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Live Updates"
        description="Manage live blog coverage with rolling timestamped updates"
        actions={
          <Button
            type="button"
            onClick={() => navigate("/admin/live-updates/create")}
            className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
          >
            <Radio className="size-4" aria-hidden />
            New Live Update
          </Button>
        }
      />

      <AdminPanel>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search live updates by title or author..."
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={[...ARTICLE_STATUS_FILTER_OPTIONS]}
        />
      </AdminPanel>

      <AdminPanel padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-admin-input-border bg-muted/40 text-xs uppercase tracking-wide text-admin-label">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Live</th>
                <th className="px-4 py-3 font-semibold">Updates</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-admin-label">
                    Loading…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-admin-label">
                    No live updates found.
                  </td>
                </tr>
              ) : (
                paged.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-admin-input-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-admin-heading">{item.title}</div>
                      <div className="text-xs text-admin-label">{item.author}</div>
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge variant={item.status}>
                        {ARTICLE_STATUS_LABELS[item.status]}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      {item.isLive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
                          LIVE
                        </span>
                      ) : (
                        <span className="text-admin-label">Off</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-admin-heading">
                      {item.entries.length}
                    </td>
                    <td className="px-4 py-3 text-admin-label">
                      {formatWhen(item.publishedAtIso)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/admin/live-updates/edit/${encodeURIComponent(item.slug)}`,
                            )
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDelete(item)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-admin-input-border px-4 py-3">
          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </AdminPanel>
    </div>
  );
}
