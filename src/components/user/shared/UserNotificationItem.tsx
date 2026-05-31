import {
  Bell,
  Bookmark,
  Check,
  Flame,
  MessageSquare,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { UserNotification, UserNotificationIcon } from "@/types/user";
import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<
  UserNotificationIcon,
  { Icon: LucideIcon; className: string }
> = {
  breaking: { Icon: Flame, className: "text-[#e7000b]" },
  technology: { Icon: TrendingUp, className: "text-zbc-gray-900" },
  recommended: { Icon: Bell, className: "text-[#7c3aed]" },
  reply: { Icon: MessageSquare, className: "text-[#0ea5e9]" },
  saved: { Icon: Bookmark, className: "text-[#f59e0b]" },
  business: { Icon: TrendingUp, className: "text-admin-label" },
};

type UserNotificationItemProps = {
  notification: UserNotification;
  onMarkRead?: () => void;
};

export function UserNotificationItem({ notification, onMarkRead }: UserNotificationItemProps) {
  const { Icon, className: iconClassName } = NOTIFICATION_ICONS[notification.icon];
  const hasActions = notification.showReadArticle || notification.showMarkRead;

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        !notification.unread && "opacity-90",
      )}
    >
      <div className="p-4">
        <Icon className={cn("size-6 shrink-0 sm:size-8", iconClassName)} strokeWidth={1.5} aria-hidden />

        <div className="mt-3 sm:mt-4">
          {notification.unread ? (
            <span
              className="mb-1 inline-block size-2 rounded-full bg-zbc-gray-900"
              aria-hidden
            />
          ) : null}

          <h3 className="text-sm font-semibold leading-5 text-admin-heading">
            {notification.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-admin-label">
            {notification.body}
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <time className="text-xs leading-4 text-admin-label">{notification.time}</time>

            {hasActions ? (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {notification.showReadArticle ? (
                  <button
                    type="button"
                    className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border px-2.5 text-xs font-medium text-admin-heading transition-colors hover:bg-muted sm:h-7 sm:flex-none"
                  >
                    Read Article
                  </button>
                ) : null}
                {notification.showMarkRead ? (
                  <button
                    type="button"
                    onClick={onMarkRead}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-admin-heading transition-colors hover:bg-muted sm:h-7 sm:flex-none"
                  >
                    <Check className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    Mark Read
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border text-admin-label transition-colors hover:bg-muted sm:size-7"
                  aria-label="More options"
                >
                  <MoreHorizontal className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="inline-flex size-8 items-center justify-center self-end rounded-lg border border-border text-admin-label transition-colors hover:bg-muted sm:size-7"
                aria-label="More options"
              >
                <MoreHorizontal className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
