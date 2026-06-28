import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InputPassword from "@/components/input-password";
import InputError from "@/components/input-error";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { fetchAdminRoles } from "@/services/admin/roles";
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  formatRoleLabel,
  updateAdminUser,
  userMatchesRoleFilter,
} from "@/services/admin/users";

const PAGE_SIZE = 10;

const userFormSchema = (isEditing: boolean) =>
  z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
      role: z.string().min(1, "Role is required"),
      status: z.enum(["active", "inactive"]),
      password: z.string(),
      password_confirmation: z.string(),
    })
    .superRefine((data, ctx) => {
      if (!isEditing && !data.password.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Password is required for new users",
          path: ["password"],
        });
      }

      if (
        data.password.trim() &&
        data.password !== data.password_confirmation
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["password_confirmation"],
        });
      }
    });

type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>;

const USER_FORM_DEFAULTS: UserFormValues = {
  name: "",
  email: "",
  role: "",
  status: "active",
  password: "",
  password_confirmation: "",
};

function applyServerErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<UserFormValues>>["setError"],
) {
  const fieldErrors = (
    error as { response?: { data?: { errors?: Record<string, string[]> } } }
  )?.response?.data?.errors;
  if (!fieldErrors) return false;

  const formFields: (keyof UserFormValues)[] = [
    "name",
    "email",
    "role",
    "status",
    "password",
    "password_confirmation",
  ];

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (!message) continue;
    if (formFields.includes(field as keyof UserFormValues)) {
      setError(field as keyof UserFormValues, { message });
    }
  }

  return true;
}

function userNameInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
    accessor: (row) => row.roleLabel,
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

function matchesSearch(user: AdminUserRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    user.name.toLowerCase().includes(q) ||
    user.email.toLowerCase().includes(q) ||
    user.roleLabel.toLowerCase().includes(q)
  );
}

export default function AdminUser() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<AdminUserRow[]>([]);
  const [roleOptions, setRoleOptions] = React.useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);

  const isEditing = editingUserId !== null;
  const isEditingRef = React.useRef(isEditing);
  isEditingRef.current = isEditing;

  const userResolver = React.useCallback<Resolver<UserFormValues>>(
    (values, context, options) =>
      zodResolver(userFormSchema(isEditingRef.current))(values, context, options),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: userResolver,
    defaultValues: USER_FORM_DEFAULTS,
  });

  const roleFilterOptions = React.useMemo(
    () => [{ value: "all", label: "All Roles" }, ...roleOptions],
    [roleOptions],
  );

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = React.useCallback(async () => {
    try {
      const roles = await fetchAdminRoles();
      setRoleOptions(
        roles.map((role) => ({
          value: role.name,
          label: formatRoleLabel(role.name),
        })),
      );
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
      setRoleOptions([]);
    }
  }, []);

  React.useEffect(() => {
    void fetchUsers();
    void fetchRoles();
  }, [fetchUsers, fetchRoles]);

  React.useEffect(() => {
    const onFocus = () => {
      void fetchUsers();
      void fetchRoles();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUsers, fetchRoles]);

  const openCreateModal = () => {
    setEditingUserId(null);
    reset(USER_FORM_DEFAULTS);
    setIsModalOpen(true);
  };

  const openEditModal = (user: AdminUserRow) => {
    setEditingUserId(user.id);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
      password_confirmation: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deleteUser = async (user: AdminUserRow) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) return;

    try {
      await deleteAdminUser(user.id);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      status: data.status,
      ...(data.password.trim()
        ? {
            password: data.password,
            password_confirmation: data.password_confirmation,
          }
        : {}),
    };

    try {
      if (isEditing && editingUserId) {
        await updateAdminUser(editingUserId, payload);
        toast.success("User updated successfully");
      } else {
        await createAdminUser(payload);
        toast.success("User created successfully");
      }
      closeModal();
      await fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      if (!applyServerErrors(error, setError)) {
        toast.error("Failed to save user");
      }
    }
  };

  const filtered = React.useMemo(() => {
    return users.filter((user) => {
      if (!matchesSearch(user, search)) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      if (!userMatchesRoleFilter(user, roleFilter)) return false;
      return true;
    });
  }, [users, search, statusFilter, roleFilter]);

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
    onActivityLog: (user) => {
      navigate(`/admin/users/${user.id}/article-activities`, {
        state: { userName: user.name, userEmail: user.email },
      });
    },
    onDelete: deleteUser,
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
          categoryOptions={roleFilterOptions}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className={cn(
            "flex max-h-[min(90dvh,100%)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden",
            "border-[#DDD8C8] bg-primary-foreground p-4 sm:w-full sm:p-6",
          )}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader className="shrink-0 pr-8 text-left">
            <DialogTitle className="text-xl font-bold text-[#151000] sm:text-2xl">
              {isEditing ? "Edit User" : "New User"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1">
                <label
                  htmlFor="user-name"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Name
                </label>
                <Input
                  id="user-name"
                  type="text"
                  placeholder="Name"
                  {...register("name")}
                />
                <InputError message={errors.name?.message} />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="user-email"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Email
                </label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                />
                <InputError message={errors.email?.message} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                  Role
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <InputError message={errors.role?.message} />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as AdminUserRow["status"])
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
                  )}
                />
                <InputError message={errors.status?.message} />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="user-password"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Password
                </label>
                <InputPassword
                  id="user-password"
                  placeholder={
                    isEditing ? "Leave blank to keep current" : "Password"
                  }
                  {...register("password")}
                />
                <InputError message={errors.password?.message} />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="user-password-confirmation"
                  className="block text-xs font-semibold tracking-wider text-[#8C8070] uppercase sm:text-sm"
                >
                  Password Confirmation
                </label>
                <InputPassword
                  id="user-password-confirmation"
                  placeholder="Password Confirmation"
                  {...register("password_confirmation")}
                />
                <InputError message={errors.password_confirmation?.message} />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full sm:w-auto"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEditing
                      ? "Saving…"
                      : "Creating…"
                    : isEditing
                      ? "Save"
                      : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
