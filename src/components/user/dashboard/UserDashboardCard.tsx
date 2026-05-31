import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type UserDashboardCardProps = {
  children: ReactNode;
  className?: string;
};

export function UserDashboardCard({ children, className }: UserDashboardCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

type UserDashboardCardHeaderProps = {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function UserDashboardCardHeader({
  title,
  icon,
  action,
  className,
}: UserDashboardCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-6 py-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-admin-heading">
        {icon ? <span className="text-admin-label">{icon}</span> : null}
        <h2 className="text-lg font-semibold leading-6">{title}</h2>
      </div>
      {action}
    </div>
  );
}
