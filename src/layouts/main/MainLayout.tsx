import { Outlet } from "react-router-dom";

import { LeftSidebar } from "@/components/main-layout/LeftSidebar/LeftSidebar";
import { MainContent } from "@/components/main-layout/MainContent/MainContent";
import { RightSidebar } from "@/components/main-layout/RightSidebar/RightSidebar";
import { StickySidebarColumn } from "@/components/main-layout/shared/StickySidebarColumn";

export function MainLayout() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto w-full container py-4 px-4 sm:py-5 lg:py-6">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,272px)_minmax(0,1fr)_minmax(0,288px)] lg:gap-7">
          <aside className="hidden lg:block">
            <StickySidebarColumn>
              <LeftSidebar />
            </StickySidebarColumn>
          </aside>

          <MainContent className="min-w-0">
            <Outlet />
          </MainContent>

          <aside className="hidden md:block">
            <StickySidebarColumn>
              <RightSidebar />
            </StickySidebarColumn>
          </aside>
        </div>

        <div className="mt-6 space-y-8 border-t border-border pt-6 lg:hidden">
          <LeftSidebar />
        </div>

        <div className="mt-6 space-y-8 border-t border-border pt-6 md:hidden">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
