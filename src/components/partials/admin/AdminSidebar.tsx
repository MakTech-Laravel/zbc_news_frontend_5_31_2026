import * as React from "react";
import {
  CreditCard,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { ZbcAdminLogo } from "@/components/partials/admin/ZbcAdminLogo";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
  Icon: LucideIcon;
  end?: boolean;
};

function navEnd(item: NavItem) {
  return item.end ?? true;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", Icon: LayoutDashboard, end: true },
  { label: "Articles", to: "/admin/articles", Icon: FileText },
  { label: "Categories", to: "/admin/categories", Icon: FolderTree },
  { label: "Users", to: "/admin/users", Icon: Users },
  { label: "Monetization", to: "/admin/monetization", Icon: CreditCard },
  { label: "Settings", to: "/admin/settings", Icon: Settings, end: false },
];

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
  return "Editor-in-Chief";
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
  const [loggingOut, setLoggingOut] = React.useState(false);
  const displayName = user?.name ?? user?.email ?? "Admin";
  const initials = getInitials(displayName);
  const avatarUrl = resolveAvatarUrl(user);

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
      {/* Logo */}
      <div className={cn("shrink-0 py-2 transition-all duration-300", collapsed ? "px-0 flex justify-center" : "px-6")}>
        {/* collapsed icon/short logo, full logo */}
        {collapsed ? (
          <div className="size-9 rounded-md bg-zbc-blue flex items-center justify-center text-xs font-bold">
            ZB
          </div>
        ) : (
          <ZbcAdminLogo />
        )}
      </div>

      {/* Nav items */}
      <nav
        className="flex shrink-0 flex-col gap-0 pt-6"
        aria-label="Admin navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={navEnd(item)}
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
            <item.Icon className="size-5 shrink-0" aria-hidden />
            {!collapsed && (
              <span className="text-base truncate">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user + logout */}
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