import * as React from "react";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { GlobalSearchField } from "@/components/search/GlobalSearchField";
import { UserNotificationsDropdown } from "@/components/user/shared/UserNotificationsDropdown";
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
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

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
        "sticky top-0 z-30 relative flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-border",
        "bg-card/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90 sm:px-6 lg:px-8",
        className,
      )}
    >
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

        <GlobalSearchField
          className="relative hidden min-w-0 flex-1 sm:block sm:max-w-[576px]"
          inputClassName="h-9 cursor-text rounded-lg border-admin-input-border pl-10 text-sm placeholder:text-admin-label/70"
          placeholder="Search articles, topics, authors..."
          aria-label="Search articles"
        />
      </div>

      <button
        type="button"
        className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-admin-label hover:bg-muted sm:hidden"
        aria-label="Search"
        onClick={() => setMobileSearchOpen((open) => !open)}
      >
        <Search className="size-4" aria-hidden />
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <UserNotificationsDropdown />

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

      {mobileSearchOpen ? (
        <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-card px-4 py-3 sm:hidden">
          <GlobalSearchField
            placeholder="Search articles, topics, authors..."
            aria-label="Search articles"
            inputClassName="h-9 rounded-lg border-admin-input-border"
          />
        </div>
      ) : null}
    </header>
  );
}
