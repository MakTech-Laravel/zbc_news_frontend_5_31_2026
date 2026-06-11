import * as React from "react";
import { Navigate } from "react-router-dom";

import { isAdminPanelUser } from "@/auth/roles";
import { useAuth } from "@/auth/useAuth";
import { UserHeader } from "@/components/partials/user/UserHeader";
import { UserSidebar } from "@/components/partials/user/UserSidebar";
import { UserOutletTransition } from "@/components/user/shared/UserOutletTransition";
import { UserNotificationsProvider } from "@/contexts/UserNotificationsContext";
import { cn } from "@/lib/utils";

export function UserLayout() {
  const { user, isUserLoading } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  if (isUserLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-admin-surface text-sm text-muted-foreground">
        Loading&hellip;
      </div>
    );
  }

  if (isAdminPanelUser(user)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <UserNotificationsProvider>
    <div className="flex h-dvh overflow-hidden bg-admin-surface">
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 lg:hidden",
          mobileNavOpen ? "block" : "hidden",
        )}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-dvh shrink-0 transition-all duration-300 lg:static lg:z-auto lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "w-[72px]" : "w-[300px]",
        )}
      >
        <UserSidebar
          collapsed={sidebarCollapsed}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col [--user-header-height:68px]">
        <UserHeader
          onMenuClick={() => setMobileNavOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-admin-surface p-4 sm:p-6 lg:p-8">
          <UserOutletTransition />
        </main>
      </div>
    </div>
    </UserNotificationsProvider>
  );
}