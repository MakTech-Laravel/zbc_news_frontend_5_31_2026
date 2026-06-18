import { useAuth } from "@/auth/useAuth";
import { UserNotificationsProvider } from "@/contexts/UserNotificationsContext";

/** Mounts notification state + realtime only for signed-in users. */
export function AuthenticatedNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isUserLoading } = useAuth();

  if (isUserLoading || !isAuthenticated) {
    return children;
  }

  return <UserNotificationsProvider>{children}</UserNotificationsProvider>;
}
