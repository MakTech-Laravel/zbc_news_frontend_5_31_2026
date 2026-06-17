import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import {
  createAdminRole,
  extractRolePermissionNames,
  fetchAdminPermissions,
  fetchAdminRole,
  formatRoleLabel,
  getRoleApiError,
  updateAdminRole,
  type AdminPermission,
} from "@/services/admin/roles";

const roleFormSchema = z.object({
  name: z.string().trim().min(1, "Role name is required"),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

function applyServerErrors(
  error: unknown,
  setError: ReturnType<typeof useForm<RoleFormValues>>["setError"],
) {
  const data = (error as { response?: { data?: { errors?: Record<string, string[]> } } })
    ?.response?.data;
  const fieldErrors = data?.errors;
  if (!fieldErrors) return false;

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = messages[0];
    if (!message) continue;
    if (field === "name" || field === "permissions") {
      setError(field, { message });
    }
  }
  return true;
}

type UseRoleFormOptions = {
  roleId?: string;
  onSuccess: () => void;
};

function buildRolePayload(
  data: RoleFormValues,
  allPermissions: AdminPermission[],
) {
  const selectedSet = new Set(data.permissions);
  const permission_ids = allPermissions
    .filter((p) => selectedSet.has(p.name))
    .map((p) => p.id);

  return {
    name: data.name,
    permissions: [...data.permissions],
    permission_ids,
  };
}

function resolveAssignedPermissions(
  assigned: string[],
  available: AdminPermission[],
): string[] {
  const availableNames = new Set(available.map((p) => p.name));
  return assigned.filter((name) => availableNames.has(name));
}

export function useRoleForm({ roleId, onSuccess }: UseRoleFormOptions) {
  const isEditing = Boolean(roleId);
  const [permissions, setPermissions] = React.useState<AdminPermission[]>([]);
  const [permissionsError, setPermissionsError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [isProtected, setIsProtected] = React.useState(false);
  const [roleDisplayName, setRoleDisplayName] = React.useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  React.useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      setLoading(true);
      setPermissionsError(false);
      setNotFound(false);

      try {
        if (isEditing && roleId) {
          const [role, allPermissions] = await Promise.all([
            fetchAdminRole(roleId),
            fetchAdminPermissions(),
          ]);

          if (cancelled) return;

          if (!role) {
            setNotFound(true);
            return;
          }

          setPermissions(allPermissions);

          const assigned = extractRolePermissionNames(role);
          const selected = resolveAssignedPermissions(assigned, allPermissions);

          setIsProtected(Boolean(role.is_protected));
          setRoleDisplayName(formatRoleLabel(role));

          form.reset({
            name: role.name,
            permissions: selected,
          });
          return;
        }

        const allPermissions = await fetchAdminPermissions();
        if (cancelled) return;

        setPermissions(allPermissions);
        setIsProtected(false);
        setRoleDisplayName(null);
        form.reset({
          name: "",
          permissions: [],
        });
      } catch (error) {
        console.error("Failed to load role form:", error);
        if (!cancelled) {
          setPermissionsError(true);
          toast.error(isEditing ? "Failed to load role" : "Failed to load permissions");
          setPermissions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadFormData();
    return () => {
      cancelled = true;
    };
  }, [isEditing, roleId, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const payload = buildRolePayload(data, permissions);

    try {
      if (isEditing && roleId) {
        await updateAdminRole(roleId, payload);
        toast.success("Role updated successfully");
      } else {
        await createAdminRole(payload);
        toast.success("Role created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save role:", error);
      if (!applyServerErrors(error, form.setError)) {
        toast.error(getRoleApiError(error, "Failed to save role"));
      }
    }
  });

  return {
    form,
    permissions,
    permissionsError,
    isEditing,
    isLoading: loading,
    notFound,
    isProtected,
    roleDisplayName,
    onSubmit,
  };
}
