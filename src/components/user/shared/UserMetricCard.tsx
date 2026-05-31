import { BookOpen, Clock, Eye, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import type { ReadingMetricIcon } from "@/data/dummy/readingAnalytics";
import { cn } from "@/lib/utils";

const ICON_CONFIG: Record<ReadingMetricIcon, { icon: LucideIcon; bg: string; color: string }> = {
  book: { icon: BookOpen, bg: "bg-zbc-gray-200", color: "text-zbc-gray-1000" },
  clock: { icon: Clock, bg: "bg-blue-100", color: "text-blue-600" },
  "trending-up": { icon: TrendingUp, bg: "bg-[#00C9501A]", color: "text-[#00C950]" },
  eye: { icon: Eye, bg: "bg-[#AD46FF1A]", color: "text-[#AD46FF]" },
};

type UserMetricCardProps = {
  label: string;
  value: string;
  sublabel: string;
  icon: ReadingMetricIcon;
  sublabelTone?: "default" | "positive";
  className?: string;
};

export function UserMetricCard({
  label,
  value,
  sublabel,
  icon,
  sublabelTone = "default",
  className,
}: UserMetricCardProps) {
  const config = ICON_CONFIG[icon];
  const Icon = config.icon;

  return (
    <UserDashboardCard className={cn("rounded-[14px] border-black/10 p-6", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
            config.bg,
            config.color,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-inter text-sm leading-5 text-ink-muted">{label}</p>
          <p className="font-inter text-2xl font-semibold leading-8 text-ink-heading">{value}</p>
          <p
            className={cn(
              "font-inter text-xs leading-4",
              sublabelTone === "positive" ? "text-[#00C950]" : "text-ink-muted",
            )}
          >
            {sublabel}
          </p>
        </div>
      </div>
    </UserDashboardCard>
  );
}
