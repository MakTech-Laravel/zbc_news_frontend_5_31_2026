import { Navigate } from "react-router-dom";
import { Controller } from "react-hook-form";

import { PermissionSelector } from "@/components/admin/roles/PermissionSelector";
import { useRoleForm } from "@/components/admin/roles/useRoleForm";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RoleFormProps = {
  roleId?: string;
  onCancel: () => void;
  onSuccess: () => void;
};

export function RoleForm({ roleId, onCancel, onSuccess }: RoleFormProps) {
  const {
    form,
    permissions,
    permissionsError,
    isEditing,
    isLoading,
    notFound,
    isProtected,
    roleDisplayName,
    onSubmit,
  } = useRoleForm({
    roleId,
    onSuccess,
  });

  if (notFound) {
    return <Navigate to="/admin/rabc" replace />;
  }

  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <AdminPanel className="bg-card">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="role-name"
              className="block text-sm font-normal text-foreground"
            >
              Role Name
            </label>
            <Input
              id="role-name"
              placeholder="Role Name"
              disabled={isProtected}
              className="h-10 rounded-md border-admin-input-border bg-card disabled:cursor-not-allowed disabled:opacity-70"
              {...register("name")}
            />
            {isProtected ? (
              <p className="text-xs text-admin-label">
                {roleDisplayName ?? "System role"} is protected and cannot be renamed. You can
                update its permissions below.
              </p>
            ) : null}
            <InputError message={errors.name?.message} />
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">Permissions</h2>
            {permissionsError ? (
              <p className="text-sm text-red-600">
                Could not load permissions. Please check you are logged in and try again.
              </p>
            ) : permissions.length === 0 ? (
              <p className="text-sm text-admin-label">
                No permissions available from the server.
              </p>
            ) : (
              <Controller
                name="permissions"
                control={control}
                render={({ field }) => (
                  <PermissionSelector
                    permissions={permissions}
                    selectedNames={field.value ?? []}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            )}
            <InputError message={errors.permissions?.message} />
          </div>

          <div
            className={cn(
              "flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end",
            )}
          >
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={onCancel}
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
      )}
    </AdminPanel>
  );
}
