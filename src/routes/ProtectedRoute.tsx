import { Navigate, useLocation } from "react-router-dom";

import { rolePolicy } from "@/auth/rolePolicy";
import { getUserRoles, hasAnyRole, isAdminPanelUser, type Role } from "@/auth/roles";
import { useAuth } from "@/auth/useAuth";

type ProtectedRouteProps = {
  roles?: Role | Role[];
  loginPath?: string;
  fallbackPath?: string;
  children: React.ReactNode;
};

function pickDashboardForUserRoles(user: ReturnType<typeof useAuth>["user"]): string {
  if (isAdminPanelUser(user)) return rolePolicy.admin?.dashboard ?? "/admin/dashboard";
  const roles = getUserRoles(user);
  if (roles.includes("user")) return rolePolicy.user?.dashboard ?? "/user/dashboard";
  for (const r of roles) {
    const dash = rolePolicy[r]?.dashboard;
    if (dash) return dash;
  }
  return "/user/dashboard";
}

export function ProtectedRoute({
  roles,
  loginPath = "/login",
  fallbackPath,
  children,
}: ProtectedRouteProps) {
  const { isSessionLoading, isUserLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isSessionLoading || isUserLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading&hellip;
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${loginPath}?next=${next}`} replace state={{ from: location }} />;
  }

  if (roles && !hasAnyRole(user, roles)) {
    const target = fallbackPath ?? pickDashboardForUserRoles(user);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
