import type { ReactNode } from "react";

import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { cn } from "@/lib/utils";

type AnalyticsChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AnalyticsChartCard({ title, subtitle, children, className }: AnalyticsChartCardProps) {
  return (
    <UserDashboardCard className={cn("rounded-[14px] border-black/10", className)}>
      <div className="border-b border-transparent px-6 pb-0 pt-6">
        <h3 className="font-inter text-base font-medium text-ink-heading">{title}</h3>
        {subtitle ? (
          <p className="mt-1 font-inter text-base text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      <div className="p-6 pt-4">{children}</div>
    </UserDashboardCard>
  );
}
