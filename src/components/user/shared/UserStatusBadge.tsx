import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type UserStatusBadgeVariant =
  | "premium"
  | "active"
  | "paid"
  | "current"
  | "featured"
  | "account";

type UserStatusBadgeProps = {
  label: string;
  variant?: UserStatusBadgeVariant;
  icon?: LucideIcon;
  className?: string;
};

const variantClass: Record<UserStatusBadgeVariant, string> = {
  premium: "bg-zbc-gray-200/50 text-admin-heading",
  active: "bg-white text-admin-heading shadow-sm",
  paid: "bg-admin-badge-published-bg text-admin-badge-published-text",
  current: "bg-muted text-admin-label",
  featured: "bg-zbc-gray-700 text-white",
  account: "bg-zbc-gray-900 px-3 text-white",
};

export function UserStatusBadge({
  label,
  variant = "premium",
  icon: Icon,
  className,
}: UserStatusBadgeProps) {
  const showSparkles = variant === "premium" || variant === "featured" || variant === "active";
  const ResolvedIcon = Icon ?? (showSparkles ? Sparkles : undefined);

  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 rounded-full px-2.5 text-xs font-medium",
        variantClass[variant],
        className,
      )}
    >
      {ResolvedIcon ? (
        <ResolvedIcon className="size-3 shrink-0" strokeWidth={2} aria-hidden />
      ) : null}
      {label}
    </span>
  );
}
