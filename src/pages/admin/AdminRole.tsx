import * as React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useRolesDataTable } from "@/components/admin/roles/useRolesDataTable";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table/types";
import {
  deleteAdminRole,
  fetchAdminRoles,
  formatRoleCreatedAt,
  formatRoleLabel,
  getRoleApiError,
  type AdminRoleRow,
} from "@/services/admin/roles";

const PAGE_SIZE = 10;

type AdminRoleListRow = AdminRoleRow & { sl: number };

function matchesSearch(role: AdminRoleRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    role.name.toLowerCase().includes(q) ||
    (role.created_by?.toLowerCase().includes(q) ?? false)
  );
}

const ADMIN_ROLE_TABLE_COLUMNS: DataTableColumn<AdminRoleListRow>[] = [
  {
    id: "sl",
    header: "SL",
    type: "text",
    accessor: (row) => row.sl,
    className: "w-14 whitespace-nowrap text-admin-trend-muted",
  },
  {
    id: "name",
    header: "Name",
    type: "custom",
    render: (row) => (
      <div className="min-w-[140px]">
        <div className="font-medium text-admin-heading">{formatRoleLabel(row)}</div>
        {row.is_protected ? (
          <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            System role
          </span>
        ) : null}
      </div>
    ),
    className: "min-w-[140px]",
  },
//   {
//     id: "created_by",
//     header: "Created By",
//     hideOnMobile: true,
//     type: "text",
//     accessor: (row) => row.created_by ?? "—",
//     className: "min-w-[140px] whitespace-nowrap",
//   },
  {
    id: "created_at",
    header: "Created Date",
    hideOnMobile: true,
    type: "custom",
    render: (row) => (
      <span className="whitespace-nowrap text-sm text-admin-trend-muted">
        {formatRoleCreatedAt(row.created_at)}
      </span>
    ),
    className: "min-w-[180px]",
  },
];

export default function AdminRole() {
  const navigate = useNavigate();
  const [roles, setRoles] = React.useState<AdminRoleRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const fetchRoles = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdminRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  React.useEffect(() => {
    const onFocus = () => void fetchRoles();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchRoles]);

  const filtered = React.useMemo(() => {
    return roles.filter((role) => matchesSearch(role, search));
  }, [roles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pagedWithSl: AdminRoleListRow[] = paged.map((role, index) => ({
    ...role,
    sl: (safePage - 1) * PAGE_SIZE + index + 1,
  }));

  const deleteRole = async (role: AdminRoleRow) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;

    try {
      await deleteAdminRole(role.id);
      toast.success("Role deleted successfully");
      await fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error(getRoleApiError(error, "Failed to delete role"));
    }
  };

  const table = useRolesDataTable({
    data: pagedWithSl,
    columns: ADMIN_ROLE_TABLE_COLUMNS,
    onEdit: (role) => navigate(`/admin/rabc/edit/${role.id}`),
    onDelete: deleteRole,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Roles"
        description="Manage roles and permissions"
        actionLabel="New Role"
        onAction={() => navigate("/admin/rabc/create")}
      />

      <AdminPanel>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search roles by name or creator..."
          statusValue="all"
          onStatusChange={() => {}}
          statusOptions={[]}
          showStatusFilter={false}
          showCategoryFilter={false}
        />
      </AdminPanel>

      <AdminPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable {...table} />
        )}
      </AdminPanel>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
