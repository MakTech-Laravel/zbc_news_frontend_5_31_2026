import * as React from "react";
import { Bell, CheckCheck, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import { UserPageShell } from "@/components/user/UserPageShell";
import { UserNotificationItem } from "@/components/user/shared/UserNotificationItem";
import { UserPageTabs } from "@/components/user/shared/UserPageTabs";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserNotifications() {
  const [activeTab, setActiveTab] = React.useState("all");
  const { unreadCount, markAsRead, markAllAsRead, filterByTab, loading } =
    useUserNotifications();

  const filtered = filterByTab(activeTab);

  if (loading) {
    return (
      <UserPageShell
        title="Notifications"
        description="Stay updated with the latest news and activity"
      >
        <p className="text-sm text-admin-label">Loading notifications…</p>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell
      title="Notifications"
      description="Stay updated with the latest news and activity"
      actions={
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
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg [&_svg]:size-4"
            aria-label="Notification settings"
            asChild
          >
            <Link to="/user/profile#notification-preferences">
              <Settings className="size-4" strokeWidth={1.5} />
            </Link>
          </Button>
        </>
      }
    >
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
    </UserPageShell>
  );
}
