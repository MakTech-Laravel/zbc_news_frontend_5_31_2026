import { Navigate, useLocation } from "react-router-dom";

import { rolePolicy } from "@/auth/rolePolicy";
import { getUserRoles, hasAnyRole, type Role } from "@/auth/roles";
import { useAuth } from "@/auth/useAuth";

type ProtectedRouteProps = {
  /** Required role(s) for this route. Pass nothing to only require authentication. */
  roles?: Role | Role[];
  /** Where unauthenticated users land. Defaults to `/login`. */
  loginPath?: string;
  /** Where wrong-role users land. Defaults to their own dashboard via rolePolicy. */
  fallbackPath?: string;
  children: React.ReactNode;
};

function pickDashboardForUserRoles(roles: string[]): string {
  if (roles.includes("admin")) return rolePolicy.admin?.dashboard ?? "/admin/dashboard";
  for (const r of roles) {
    const dash = rolePolicy[r]?.dashboard;
    if (dash) return dash;
  }
  return "/user/dashboard";
}

/**
 * Gate that requires the visitor to be authenticated and (optionally) to have
 * one of the given roles. Mirrors the previous role/permission gates but is
 * compact enough to live alongside the rest of the routing code.
 */
export function ProtectedRoute({
  roles,
  loginPath = "/login",
  fallbackPath,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, isSessionLoading, isUserLoading, user } = useAuth();
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
    const userRoles = getUserRoles(user);
    const target = fallbackPath ?? pickDashboardForUserRoles(userRoles);
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
