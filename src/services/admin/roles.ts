import { request } from "@/api/request";

export type AdminPermission = {
  id: number | string;
  name: string;
  guard_name?: string;
  group?: string;
};

export type AdminRoleRow = {
  id: number;
  name: string;
  display_name?: string | null;
  is_protected?: boolean;
  created_by?: string | null;
  created_at: string;
  permissions?: AdminPermission[];
};

export function formatRoleLabel(role: Pick<AdminRoleRow, "name" | "display_name">): string {
  if (role.display_name?.trim()) return role.display_name.trim();
  return role.name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type RoleFormPayload = {
  name: string;
  permissions: string[];
  permission_ids?: Array<number | string>;
};

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

function unwrapItem<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;
  if ("data" in payload) {
    const inner = (payload as { data: unknown }).data;
    return (inner && typeof inner === "object" ? inner : payload) as T;
  }
  return payload as T;
}

export async function fetchAdminRoles(): Promise<AdminRoleRow[]> {
  const response = await request.get("/admin/roles");
  return unwrapList<AdminRoleRow>(response.data);
}

function extractPermissionsField(raw: Record<string, unknown>): unknown {
  return (
    raw.permissions ??
    raw.permission ??
    raw.role_permissions ??
    raw.assigned_permissions
  );
}

export function extractRolePermissionNames(
  role: AdminRoleRow | Record<string, unknown>,
): string[] {
  const raw =
    "permissions" in role && role.permissions !== undefined
      ? role.permissions
      : extractPermissionsField(role as Record<string, unknown>);

  if (!Array.isArray(raw)) return [];

  return normalizePermissionList(raw).map((p) => p.name);
}

function unwrapRole(payload: unknown): AdminRoleRow | null {
  const raw = unwrapItem<Record<string, unknown>>(payload);
  if (!raw) return null;

  const id =
    typeof raw.id === "number"
      ? raw.id
      : typeof raw.id === "string"
        ? Number(raw.id)
        : NaN;
  if (!Number.isFinite(id)) return null;

  const permissionsRaw = extractPermissionsField(raw);
  const permissions = Array.isArray(permissionsRaw)
    ? normalizePermissionList(permissionsRaw)
    : [];

  const createdBy =
    typeof raw.created_by === "string"
      ? raw.created_by
      : typeof raw.created_by_name === "string"
        ? raw.created_by_name
        : typeof raw.creator === "string"
          ? raw.creator
          : null;

  return {
    id,
    name: typeof raw.name === "string" ? raw.name : String(raw.name ?? ""),
    display_name:
      typeof raw.display_name === "string"
        ? raw.display_name
        : typeof raw.displayName === "string"
          ? raw.displayName
          : null,
    is_protected:
      raw.is_protected === true ||
      raw.is_protected === 1 ||
      raw.is_protected === "1" ||
      raw.isProtected === true,
    created_by: createdBy,
    created_at: typeof raw.created_at === "string" ? raw.created_at : "",
    permissions,
  };
}

export async function fetchAdminRole(roleId: number | string): Promise<AdminRoleRow | null> {
  const response = await request.get(`/admin/roles/show/${roleId}`);
  return unwrapRole(response.data);
}

function normalizePermission(
  raw: Record<string, unknown> | string,
  fallbackGroup?: string,
): AdminPermission | null {
  if (typeof raw === "string") {
    const name = raw.trim();
    if (!name) return null;
    return { id: name, name, group: fallbackGroup };
  }

  const nameRaw = raw.name ?? raw.permission_name ?? raw.title ?? raw.permission;
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (!name) return null;

  const rawGroup = raw.group ?? raw.group_name ?? raw.module ?? fallbackGroup;
  const group =
    typeof rawGroup === "string" && rawGroup.trim() ? rawGroup.trim() : undefined;

  const id = raw.id;
  const numericId =
    typeof id === "number" ? id : typeof id === "string" && id ? Number(id) : NaN;

  return {
    id: Number.isFinite(numericId) ? numericId : name,
    name,
    guard_name: typeof raw.guard_name === "string" ? raw.guard_name : undefined,
    group,
  };
}

function normalizePermissionList(items: unknown[], fallbackGroup?: string): AdminPermission[] {
  const out: AdminPermission[] = [];
  for (const item of items) {
    if (typeof item === "string") {
      const permission = normalizePermission(item, fallbackGroup);
      if (permission) out.push(permission);
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const permission = normalizePermission(item as Record<string, unknown>, fallbackGroup);
    if (permission) out.push(permission);
  }
  return out;
}

function unwrapGroupedObject(obj: Record<string, unknown>): AdminPermission[] {
  const out: AdminPermission[] = [];
  for (const [groupName, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      out.push(...normalizePermissionList(value, groupName));
    }
  }
  return out;
}

function unwrapPermissions(payload: unknown): AdminPermission[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    if (payload.length === 0) return [];
    const first = payload[0];
    if (first && typeof first === "object" && "permissions" in first) {
      const out: AdminPermission[] = [];
      for (const item of payload) {
        if (!item || typeof item !== "object") continue;
        const groupItem = item as Record<string, unknown>;
        const groupName =
          typeof groupItem.group === "string"
            ? groupItem.group
            : typeof groupItem.group_name === "string"
              ? groupItem.group_name
              : typeof groupItem.name === "string"
                ? groupItem.name
                : undefined;
        const nested = groupItem.permissions;
        if (!Array.isArray(nested)) continue;
        out.push(...normalizePermissionList(nested, groupName));
      }
      return out;
    }
    return normalizePermissionList(payload);
  }

  if (typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const data = "data" in root ? root.data : payload;

  if (Array.isArray(data)) {
    return unwrapPermissions(data);
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (Array.isArray(obj.permissions)) {
      return normalizePermissionList(obj.permissions);
    }

    if (obj.permissions && typeof obj.permissions === "object" && !Array.isArray(obj.permissions)) {
      return unwrapGroupedObject(obj.permissions as Record<string, unknown>);
    }

    if (Array.isArray(obj.data)) {
      return unwrapPermissions(obj.data);
    }

    return unwrapGroupedObject(obj);
  }

  return [];
}

export async function fetchAdminPermissions(): Promise<AdminPermission[]> {
  const response = await request.get("/admin/permissions");
  return unwrapPermissions(response.data);
}

export async function createAdminRole(payload: RoleFormPayload): Promise<void> {
  await request.post("/admin/roles/store", payload);
}

export async function updateAdminRole(
  id: number | string,
  payload: RoleFormPayload,
): Promise<void> {
  await request.post(`/admin/roles/update/${id}`, payload);
}

import { getAuthErrorMessage } from "@/features/auth/errorMessage";

export async function deleteAdminRole(id: number | string): Promise<void> {
  await request.delete(`/admin/roles/delete/${id}`);
}

export function getRoleApiError(error: unknown, fallback: string): string {
  return getAuthErrorMessage(error, fallback);
}

export function formatRoleCreatedAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month}, ${year} ${time}`;
}
