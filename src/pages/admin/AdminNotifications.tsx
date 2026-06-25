import {
  NotificationPageActions,
  NotificationsPageContent,
} from "@/components/notifications/NotificationsPageContent";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";

export default function AdminNotifications() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Stay updated with platform activity and subscriber alerts"
        actions={<NotificationPageActions />}
      />
      <NotificationsPageContent />
    </div>
  );
}
