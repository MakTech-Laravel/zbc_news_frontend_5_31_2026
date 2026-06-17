import * as React from "react";
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { Input } from "@/components/ui/input";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { cn } from "@/lib/utils";

type UserHeaderProps = {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  className?: string;
};

export function UserHeader({
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed,
  className,
}: UserHeaderProps) {
  const { logout } = useAuth();
  const { unreadCount } = useUserNotifications();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-border",
        "bg-card/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90 sm:px-6 lg:px-8",
        className,
      )}
    >
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="hidden lg:inline-flex size-9 items-center justify-center rounded-lg text-admin-label hover:bg-muted transition-colors"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-5" aria-hidden />
          ) : (
            <PanelLeftClose className="size-5" aria-hidden />
          )}
        </button>

        <button
          type="button"
          className="inline-flex lg:hidden size-9 items-center justify-center rounded-lg text-admin-label hover:bg-muted"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-[576px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-label"
            aria-hidden
          />
          <Input
            type="search"
            readOnly
            placeholder="Search articles, topics, authors..."
            onClick={() => setSearchOpen(true)}
            onFocus={() => setSearchOpen(true)}
            className="h-9 w-full cursor-pointer rounded-lg border-admin-input-border pl-10 text-sm placeholder:text-admin-label/70"
            aria-label="Open search"
          />
        </div>
      </div>

      <button
        type="button"
        className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-admin-label hover:bg-muted sm:hidden"
        aria-label="Search"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="size-4" aria-hidden />
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          to="/user/notifications"
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-admin-label hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-4" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-admin-notification px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-admin-label hover:bg-muted disabled:opacity-50 sm:px-3"
          aria-label="Sign out"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </header>
  );
}
