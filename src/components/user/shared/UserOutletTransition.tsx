import { Outlet, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

export function UserOutletTransition() {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className={cn("user-portal-fade-in")}>
      <Outlet />
    </div>
  );
}
