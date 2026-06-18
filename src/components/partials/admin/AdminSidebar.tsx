import * as React from "react";
import {
  CreditCard,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { ZbcAdminLogo } from "@/components/partials/admin/ZbcAdminLogo";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/categories": FolderTree,
  "/admin/articles": FileText,
  "/admin/media": Image,
  "/admin/rabc": ShieldCheck,
  "/admin/users": Users,
  "/admin/monetization": CreditCard,
  "/admin/comments": MessageSquare,
  "/admin/settings": Settings,
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function resolveRoleLabel(user: ReturnType<typeof useAuth>["user"]) {
  const spatie = user?.adminSpatieRoles?.[0];
  if (spatie) return spatie.replace(/-/g, " ");
  if (user?.is_super_admin) return "Super Admin";
  if (user?.role) return user.role.replace(/-/g, " ");
  return "Staff";
}

function resolveAvatarUrl(user: ReturnType<typeof useAuth>["user"]) {
  if (!user) return null;
  const raw = user as Record<string, unknown>;
  const candidate =
    user.avatar ??
    raw.avatar_url ??
    raw.profile_image ??
    raw.profile_image_url ??
    raw.image;
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

type AdminSidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const displayName = user?.name ?? user?.email ?? "Admin";
  const initials = getInitials(displayName);
  const avatarUrl = resolveAvatarUrl(user);

  const visibleNavItems = ADMIN_NAV_ITEMS.filter((item) =>
    item.permission ? can(item.permission) : true,
  );

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-admin-sidebar text-white">
      <div className={cn("shrink-0 py-2 transition-all duration-300", collapsed ? "px-0 flex justify-center" : "px-6")}>
        {collapsed ? (
          <div className="size-9 rounded-md bg-zbc-blue flex items-center justify-center text-xs font-bold">
            ZB
          </div>
        ) : (
          <ZbcAdminLogo />
        )}
      </div>

      <nav
        className="flex shrink-0 flex-col gap-0 pt-6"
        aria-label="Admin navigation"
      >
        {visibleNavItems.map((item) => {
          const Icon = NAV_ICONS[item.path] ?? LayoutDashboard;
          const end = item.end ?? true;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={end}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex h-12 items-center transition-colors",
                  collapsed ? "justify-center px-0" : "gap-3 px-6 py-3",
                  isActive
                    ? cn(
                      "bg-zbc-blue text-white",
                      !collapsed && "border-l-4 border-admin-nav-active-border pl-7 pr-6",
                    )
                    : "text-admin-nav-muted hover:text-white",
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {!collapsed && (
                <span className="text-base truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto shrink-0 border-t border-admin-sidebar-border py-4 transition-all duration-300",
          collapsed ? "flex flex-col items-center gap-3 px-2" : "space-y-3 px-4",
        )}
      >
        {collapsed ? (
          <span
            className="relative inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-zbc-blue"
            title={displayName}
          >
            {avatarUrl ? (
              <HeaderAvatar
                src={avatarUrl}
                alt={displayName}
                className="size-10 rounded-full"
              />
            ) : (
              <span className="inline-flex size-full items-center justify-center text-sm font-semibold">
                {initials}
              </span>
            )}
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <span className="relative inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-zbc-blue">
              {avatarUrl ? (
                <HeaderAvatar
                  src={avatarUrl}
                  alt={displayName}
                  className="size-10 rounded-full"
                />
              ) : (
                <span className="inline-flex size-full items-center justify-center text-sm font-semibold">
                  {initials}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-admin-nav-muted">{resolveRoleLabel(user)}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          title="Sign out"
          className={cn(
            "flex items-center rounded-lg text-admin-nav-muted transition-colors",
            "hover:bg-white/10 hover:text-white disabled:opacity-50",
            collapsed ? "size-10 justify-center" : "h-10 w-full gap-3 px-3",
          )}
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          {!collapsed ? (
            <span className="text-sm font-medium">{loggingOut ? "Signing out…" : "Sign out"}</span>
          ) : null}
        </button>
      </div>
    </aside>
  );
}
