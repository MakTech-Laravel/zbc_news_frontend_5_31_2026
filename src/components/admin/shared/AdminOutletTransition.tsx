import { Outlet, useLocation } from "react-router-dom";

export function AdminOutletTransition() {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="admin-portal-fade-in">
      <Outlet />
    </div>
  );
}
