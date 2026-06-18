import * as React from "react";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { AdminPanelSearchModal } from "@/components/search/AdminPanelSearchModal";
import { UserNotificationsDropdown } from "@/components/user/shared/UserNotificationsDropdown";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/types/permissions";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  className?: string;
};

export function AdminHeader({
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed,
  className,
}: AdminHeaderProps) {
  const { logout } = useAuth();
  const { can } = usePermission();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const canViewNotifications = can(PERMISSIONS.USER_NOTIFICATIONS.LIST);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  function openSearch() {
    setSearchOpen(true);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border",
        "bg-card/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90 sm:px-6",
        className,
      )}
    >
      <AdminPanelSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        seedQuery={searchQuery}
        onQueryChange={setSearchQuery}
      />

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

        <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-admin-label"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={openSearch}
            onClick={openSearch}
            placeholder="Search articles, users, media..."
            className="h-10 w-full cursor-text rounded-[10px] border-admin-input-border pl-10 text-sm placeholder:text-foreground/50 sm:h-[42px] sm:text-base"
            aria-label="Search admin panel"
          />
        </div>
      </div>

      <button
        type="button"
        className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-admin-label hover:bg-muted sm:hidden"
        aria-label="Search"
        onClick={openSearch}
      >
        <Search className="size-5" aria-hidden />
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {canViewNotifications ? (
          <UserNotificationsDropdown className="rounded-lg text-admin-label hover:bg-muted" />
        ) : null}

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-admin-label hover:bg-muted disabled:opacity-50 sm:px-3"
          aria-label="Sign out"
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{loggingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </header>
  );
}
