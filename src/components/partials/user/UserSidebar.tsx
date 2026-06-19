import * as React from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  Globe,
  LayoutDashboard,
  LogOut,
  Newspaper,
  TrendingUp,
  User,
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

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/user/dashboard", Icon: LayoutDashboard, end: true },
  { label: "Saved Articles", to: "/user/saved-articles", Icon: Bookmark },
  { label: "Profile", to: "/user/profile", Icon: User },
  { label: "Notifications", to: "/user/notifications", Icon: Bell },
  // { label: "Membership", to: "/user/membership", Icon: CreditCard },
  { label: "Reading Analytics", to: "/user/reading-analytics", Icon: BarChart3 },
];

const EXPLORE_NAV: NavItem[] = [
  { label: "Breaking News", to: "/user/breaking-news", Icon: TrendingUp },
  { label: "World", to: "/user/world", Icon: Globe },
  { label: "Editorial", to: "/user/editorial", Icon: Newspaper },
  { label: "Long Reads", to: "/user/long-reads", Icon: BookOpen },
];

function navEnd(item: NavItem) {
  return item.end ?? false;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
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

function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={navEnd(item)}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex h-12 items-center text-base font-normal leading-6 transition-colors",
          collapsed ? "justify-center px-0" : "gap-3 px-6 py-3",
          isActive
            ? cn(
                "bg-zbc-blue text-white",
                !collapsed && "border-l-4 border-admin-nav-active-border pl-7 pr-6",
              )
            : "bg-admin-sidebar text-admin-nav-muted hover:text-white",
        )
      }
    >
      <item.Icon className="size-5 shrink-0 stroke-[1.5]" aria-hidden />
      {!collapsed && item.label}
    </NavLink>
  );
}

type UserSidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function UserSidebar({ collapsed = false, onNavigate }: UserSidebarProps) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const displayName = user?.name ?? user?.email ?? "John Doe";
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
      <div
        className={cn(
          "shrink-0 py-2 transition-all duration-300",
          collapsed ? "flex justify-center px-0" : "px-6",
        )}
      >
        <ZbcAdminLogo collapsed={collapsed} />
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="shrink-0 px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-zbc-gray-700 text-white">
            <span className="relative inline-flex size-10 shrink-0 overflow-hidden">
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
              <p className="truncate text-sm font-medium leading-5">{displayName}</p>
              <p className="truncate text-xs leading-4 text-admin-nav-muted">
                Premium Member
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: avatar only */}
      {collapsed && (
        <div className="flex justify-center py-3">
          <span className="relative inline-flex size-9 shrink-0 overflow-hidden rounded-full bg-zbc-blue">
            {avatarUrl ? (
              <HeaderAvatar
                src={avatarUrl}
                alt={displayName}
                className="size-9 rounded-full"
              />
            ) : (
              <span className="inline-flex size-full items-center justify-center text-xs font-semibold">
                {initials}
              </span>
            )}
          </span>
        </div>
      )}

      {!collapsed && <div className="mx-4 h-px shrink-0 bg-admin-sidebar-border" />}

      {/* Nav */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto pt-4"
        aria-label="User navigation"
      >
        <div className={cn("flex flex-col gap-1", collapsed ? "px-0" : "px-3")}>
          {MAIN_NAV.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {!collapsed && (
          <div className="mt-6 px-6">
            <p className="text-xs font-medium uppercase tracking-[0.6px] text-[#a1a1a1]">
              Explore
            </p>
          </div>
        )}

        <div className={cn("mt-2 flex flex-col gap-1", collapsed ? "px-0" : "px-3")}>
          {EXPLORE_NAV.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Footer actions */}
      <div
        className={cn(
          "shrink-0 border-t border-admin-sidebar-border p-3",
          collapsed ? "flex flex-col items-center gap-2" : "space-y-1",
        )}
      >
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          title="Sign out"
          className={cn(
            "flex h-10 w-full items-center rounded-lg text-base transition-colors",
            "text-admin-nav-muted hover:bg-admin-sidebar-border/40 hover:text-white disabled:opacity-50",
            collapsed ? "justify-center px-0" : "gap-3 px-3",
          )}
        >
          <LogOut className="size-5 shrink-0 stroke-[1.5]" aria-hidden />
          {!collapsed && (loggingOut ? "Signing out…" : "Sign out")}
        </button>
      </div>
    </aside>
  );
}