import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserNotificationItem } from "@/components/user/shared/UserNotificationItem";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserNotificationsDropdownProps = {
  className?: string;
};

export function UserNotificationsDropdown({ className }: UserNotificationsDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useUserNotifications();
  const recent = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-admin-label hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-4" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-admin-notification px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,24rem)] rounded-xl border border-border bg-card p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-admin-heading">Notifications</p>
            <p className="text-xs text-admin-label">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-admin-label"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Mark all
          </Button>
        </div>

        <div className="max-h-[22rem] space-y-2 overflow-y-auto p-3">
          {loading ? (
            <p className="px-2 py-6 text-center text-sm text-admin-label">
              Loading notifications…
            </p>
          ) : recent.length === 0 ? (
            <p className="rounded-lg border border-border bg-zbc-gray-100 px-3 py-6 text-center text-sm text-admin-label">
              No notifications yet.
            </p>
          ) : (
            recent.map((notification) => (
              <UserNotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={() => void markAsRead(notification.id)}
              />
            ))
          )}
        </div>

        <div className="border-t border-border p-3">
          <Button
            variant="outline"
            className="h-9 w-full rounded-lg text-sm font-medium"
            asChild
          >
            <Link to="/user/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
