import { UserPageShell } from "@/components/user/UserPageShell";
import {
  NotificationPageActions,
  NotificationsPageContent,
} from "@/components/notifications/NotificationsPageContent";

export default function UserNotifications() {
  return (
    <UserPageShell
      title="Notifications"
      description="Stay updated with the latest news and activity"
      actions={
        <NotificationPageActions settingsHref="/user/profile#notification-preferences" />
      }
    >
      <NotificationsPageContent />
    </UserPageShell>
  );
}
