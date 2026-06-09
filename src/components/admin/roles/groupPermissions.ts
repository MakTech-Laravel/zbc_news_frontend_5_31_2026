import type { AdminPermission } from "@/services/admin/roles";

export type PermissionGroup = {
  key: string;
  label: string;
  permissions: AdminPermission[];
};

function formatPermissionGroupLabel(groupKey: string): string {
  return groupKey
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Groups permissions by API `group` field (e.g. "user" → one card with all user permissions).
 * Permissions without a group fall into "Other".
 */
export function groupPermissions(permissions: AdminPermission[]): PermissionGroup[] {
  const map = new Map<string, AdminPermission[]>();

  for (const permission of permissions) {
    const key = permission.group?.trim() || "other";
    const existing = map.get(key) ?? [];
    existing.push(permission);
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([key, items]) => ({
      key,
      label: key === "other" ? "Other" : formatPermissionGroupLabel(key),
      permissions: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
