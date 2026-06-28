import type { AdminUserRow } from "@/components/admin/users/useUsersDataTable";
import { api } from "@/api/client";
import { request } from "@/api/request";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";

export type AdminUserApiPayload = {
  name: string;
  email: string;
  role: string;
  status: AdminUserRow["status"];
  password?: string;
  password_confirmation?: string;
};

function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

export function formatRoleLabel(role: string): string {
  if (!role || role === "—") return "—";
  return role
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatUserJoined(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function extractRoleNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item && typeof item === "object" && "name" in item) {
        const name = (item as { name: unknown }).name;
        return typeof name === "string" ? name.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

function resolveUserStatus(raw: Record<string, unknown>): AdminUserRow["status"] {
  const status = raw.status;
  if (status === "inactive" || status === 0 || status === false) return "inactive";
  if (status === "active" || status === 1 || status === true) return "active";
  if (raw.is_active === false || raw.is_active === 0) return "inactive";
  if (raw.is_active === true || raw.is_active === 1) return "active";
  return "active";
}

export function normalizeAdminUser(raw: Record<string, unknown>): AdminUserRow | null {
  const id = raw.id;
  if (id === undefined || id === null) return null;

  const roles = extractRoleNames(raw.roles);
  const primaryRole = roles[0] ?? "";

  return {
    id: String(id),
    name: typeof raw.name === "string" ? raw.name : String(raw.name ?? ""),
    email: typeof raw.email === "string" ? raw.email : String(raw.email ?? ""),
    role: primaryRole,
    roleLabel: primaryRole ? formatRoleLabel(primaryRole) : "—",
    roles,
    status: resolveUserStatus(raw),
    joined: formatUserJoined(
      typeof raw.created_at === "string" ? raw.created_at : undefined,
    ),
    avatarUrl:
      typeof raw.avatar === "string" && raw.avatar.trim()
        ? raw.avatar
        : typeof raw.avatar_url === "string" && raw.avatar_url.trim()
          ? raw.avatar_url
          : null,
  };
}

export function normalizeAdminUsers(payload: unknown): AdminUserRow[] {
  return unwrapList(payload)
    .map((item) =>
      item && typeof item === "object"
        ? normalizeAdminUser(item as Record<string, unknown>)
        : null,
    )
    .filter((user): user is AdminUserRow => user !== null);
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const response = await request.get("/admin/users");
  return normalizeAdminUsers(response.data);
}

function postAdminUser(
  url: string,
  payload: AdminUserApiPayload,
): Promise<unknown> {
  return api.request({
    method: "POST",
    url,
    data: payload,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

export async function createAdminUser(payload: AdminUserApiPayload): Promise<void> {
  await postAdminUser("/admin/users/store", payload);
}

export async function updateAdminUser(
  userId: string | number,
  payload: AdminUserApiPayload,
): Promise<void> {
  await postAdminUser(`/admin/users/update/${userId}`, payload);
}

export function getAdminUserApiError(error: unknown, fallback: string): string {
  return getAuthErrorMessage(error, fallback);
}

export async function deleteAdminUser(userId: string | number): Promise<void> {
  await request.delete(`/admin/users/delete/${userId}`);
}

export function userMatchesRoleFilter(user: AdminUserRow, roleFilter: string): boolean {
  if (roleFilter === "all") return true;
  return user.roles.includes(roleFilter) || user.role === roleFilter;
}
