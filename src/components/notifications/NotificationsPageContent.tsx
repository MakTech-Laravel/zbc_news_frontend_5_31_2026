import * as React from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, Settings } from "lucide-react";

import { UserNotificationItem } from "@/components/user/shared/UserNotificationItem";
import { UserPageTabs } from "@/components/user/shared/UserPageTabs";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationPageActionsProps = {
  settingsHref?: string;
};

export function NotificationPageActions({ settingsHref }: NotificationPageActionsProps) {
  const { unreadCount, markAllAsRead } = useUserNotifications();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 flex-1 gap-2 rounded-lg px-3 text-sm font-medium sm:flex-none [&_svg]:size-4"
        onClick={markAllAsRead}
        disabled={unreadCount === 0}
      >
        <CheckCheck className="size-4" strokeWidth={1.5} aria-hidden />
        Mark All as Read
      </Button>
      {settingsHref ? (
        <Button
          variant="outline"
          size="icon"
          className="size-9 shrink-0 rounded-lg [&_svg]:size-4"
          aria-label="Notification settings"
          asChild
        >
          <Link to={settingsHref}>
            <Settings className="size-4" strokeWidth={1.5} />
          </Link>
        </Button>
      ) : null}
    </>
  );
}

export function NotificationsPageContent() {
  const [activeTab, setActiveTab] = React.useState("all");
  const {
    unreadCount,
    markAsRead,
    filterByTab,
    loading,
    setActiveCategory,
  } = useUserNotifications();

  React.useEffect(() => {
    setActiveCategory(activeTab);
  }, [activeTab, setActiveCategory]);

  const filtered = filterByTab(activeTab);

  if (loading) {
    return <p className="text-sm text-admin-label">Loading notifications…</p>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border px-4 py-4",
          unreadCount > 0 ? "bg-brand-soft/60" : "bg-zbc-gray-100",
        )}
      >
        <Bell
          className={cn(
            "size-5 shrink-0",
            unreadCount > 0 ? "text-brand-deep" : "text-admin-label",
          )}
          strokeWidth={1.5}
          aria-hidden
        />
        <p
          className={cn(
            "text-sm font-medium",
            unreadCount > 0 ? "text-brand-deep" : "text-admin-label",
          )}
        >
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You're all caught up"}
        </p>
      </div>

      <UserPageTabs
        tabs={[
          { id: "all", label: "All", badge: unreadCount > 0 ? unreadCount : undefined },
          { id: "unread", label: "Unread", badge: unreadCount > 0 ? unreadCount : undefined },
          { id: "breaking", label: "Breaking" },
          { id: "topics", label: "Topics" },
          { id: "social", label: "Social" },
          { id: "saved", label: "Saved" },
          { id: "system", label: "System" },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-admin-label">
            No notifications in this view.
          </p>
        ) : (
          filtered.map((notification) => (
            <UserNotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={() => markAsRead(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
