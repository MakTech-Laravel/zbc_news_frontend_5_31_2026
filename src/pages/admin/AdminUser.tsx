import * as React from "react";

import {
  useUsersDataTable,
  type AdminUserRow,
} from "@/components/admin/users/useUsersDataTable";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import type { DataTableColumn } from "@/components/ui/data-table/types";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { DataTable } from "@/components/ui/data-table";
import { MOCK_ADMIN_USERS } from "@/data/admin/mockUsers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputPassword from "@/components/input-password";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";


const PAGE_SIZE = 10;

function userNameInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Desktop: Name, Role, Status, Joined visible in the table.
 * Mobile: only Name in the row; Role, Status, Joined open in the collapse drawer (like Actions).
 */
const ADMIN_USER_TABLE_COLUMNS: DataTableColumn<AdminUserRow>[] = [
  {
    id: "name",
    header: "Name",
    type: "avatarStack",
    avatarStack: {
      src: (row) => row.avatarUrl,
      fallback: (row) => userNameInitials(row.name),
      alt: (row) => row.name,
      primary: (row) => row.name,
      secondary: (row) => row.email,
    },
    className: "min-w-[180px]",
  },
  {
    id: "role",
    header: "Role",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => row.role,
    className: "min-w-[140px] whitespace-nowrap",
  },
  {
    id: "status",
    header: "Status",
    hideOnMobile: true,
    type: "badge",
    badge: (row) => ({
      variant: row.status,
      label: row.status === "active" ? "Active" : "Inactive",
    }),
    className: "whitespace-nowrap",
  },
  {
    id: "joined",
    header: "Joined",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => row.joined,
    className: "whitespace-nowrap text-admin-trend-muted",
  },
];

const USER_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

const USER_ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "Editor-in-Chief", label: "Editor-in-Chief" },
  { value: "Senior Editor", label: "Senior Editor" },
  { value: "Editor", label: "Editor" },
  { value: "Contributor", label: "Contributor" },
  { value: "Admin", label: "Admin" },
] as const;

const USER_FORM_ROLE_OPTIONS = USER_ROLE_OPTIONS.filter(
  (option) => option.value !== "all",
);

const EMPTY_USER_FORM = {
  name: "",
  email: "",
  role: "",
  status: "active" as AdminUserRow["status"],
  password: "",
  password_confirmation: "",
  avatar: null as string | null,
};

function matchesSearch(user: AdminUserRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    user.name.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q)
  );
}

export default function AdminUser() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState(EMPTY_USER_FORM);

  const isEditing = editingUserId !== null;

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormData({ ...EMPTY_USER_FORM });
    setIsModalOpen(true);
  };

  const openEditModal = (user: AdminUserRow) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
      password_confirmation: "",
      avatar: user.avatarUrl ?? null,
    });
    setIsModalOpen(true);
  };

  const filtered = React.useMemo(() => {
    return MOCK_ADMIN_USERS.filter((user) => {
      if (!matchesSearch(user, search)) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      return true;
    });
  }, [search, statusFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const table = useUsersDataTable({
    data: paged,
    columns: ADMIN_USER_TABLE_COLUMNS,
    selectedIds,
    onSelectionChange: setSelectedIds,
    onEdit: openEditModal,
    onDelete: () => {
      /* confirm delete */
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Users"
        description="Manage all your users"
        actionLabel="New User"
        onAction={openCreateModal}
      />

      <AdminPanel>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search users by name or email..."
          statusValue={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          statusOptions={[...USER_STATUS_OPTIONS]}
          categoryValue={roleFilter}
          onCategoryChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
          categoryOptions={[...USER_ROLE_OPTIONS]}
        />
      </AdminPanel>

      <AdminPanel padding="none" className="overflow-hidden">
        <DataTable {...table} />
      </AdminPanel>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className={cn(
            'flex max-h-[min(90dvh,100%)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden',
            'border-[#DDD8C8] bg-primary-foreground p-4 sm:w-full sm:p-6',
          )}
        >
          <DialogHeader className="shrink-0 pr-8 text-left">
            <DialogTitle className="text-xl font-bold text-[#151000] sm:text-2xl">
              {isEditing ? "Edit User" : "New User"}
            </DialogTitle>
          </DialogHeader>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-1">
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">Name</label>
                  <Input 
                    type="text" 
                    placeholder="Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">Email</label>
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">Role</label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_FORM_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as AdminUserRow["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">Password</label>
                  <InputPassword 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="password_confirmation" className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">Password Confirmation</label>
                  <InputPassword 
                    placeholder="Password Confirmation" 
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  />
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full sm:w-auto"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-10 w-full sm:w-auto"
                    onClick={() => {
                      console.log(
                        isEditing ? "Update user:" : "Create user:",
                        { id: editingUserId, ...formData },
                      );
                      setIsModalOpen(false);
                    }}
                  >
                    {isEditing ? "Save" : "Create"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}
