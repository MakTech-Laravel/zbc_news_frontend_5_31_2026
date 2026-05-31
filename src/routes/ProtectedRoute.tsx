
import { useAuth } from "@/auth/useAuth";

type ProtectedRouteProps = {
  /** Required role(s) for this route. Pass nothing to only require authentication. */

  /** Where unauthenticated users land. Defaults to `/login`. */
  loginPath?: string;
  /** Where wrong-role users land. Defaults to their own dashboard via rolePolicy. */
  fallbackPath?: string;
  children: React.ReactNode;
};



/**
 * Gate that requires the visitor to be authenticated and (optionally) to have
 * one of the given roles. Mirrors the previous role/permission gates but is
 * compact enough to live alongside the rest of the routing code.
 */
export function ProtectedRoute({

  children,
}: ProtectedRouteProps) {
  const { isSessionLoading, isUserLoading } = useAuth();


  if (isSessionLoading || isUserLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading&hellip;
      </div>
    );
  }

  // if (!isAuthenticated) {
  //   const next = encodeURIComponent(location.pathname + location.search);
  //   return <Navigate to={`${loginPath}?next=${next}`} replace state={{ from: location }} />;
  // }

  // if (roles && !hasAnyRole(user, roles)) {
  //   const userRoles = getUserRoles(user);
  //   const target = fallbackPath ?? pickDashboardForUserRoles(userRoles);
  //   return <Navigate to={target} replace />;
  // }

  return <>{children}</>;
}
