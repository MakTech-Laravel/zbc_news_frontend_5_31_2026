import * as React from "react";
import { AdminHeader } from "@/components/partials/admin/AdminHeader";
import { AdminSidebar } from "@/components/partials/admin/AdminSidebar";
import { AdminOutletTransition } from "@/components/admin/shared/AdminOutletTransition";
import { cn } from "@/lib/utils";

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
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
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader
          onMenuClick={() => setMobileNavOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 sm:mt-5 sm:px-6">
          <AdminOutletTransition />
        </main>
      </div>
    </div>
  );
}