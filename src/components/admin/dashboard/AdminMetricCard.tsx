import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type MetricIconTone =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "yellow"
  | "indigo"
  | "red";

const ICON_TONE_CLASSES: Record<MetricIconTone, { box: string; icon: string }> = {
  blue: { box: "bg-admin-metric-blue-bg", icon: "text-admin-chart-blue" },
  green: { box: "bg-admin-metric-green-bg", icon: "text-admin-chart-green" },
  purple: { box: "bg-admin-metric-purple-bg", icon: "text-admin-chart-purple" },
  orange: { box: "bg-admin-metric-orange-bg", icon: "text-zbc-breaking" },
  yellow: { box: "bg-admin-metric-yellow-bg", icon: "text-admin-badge-draft-text" },
  indigo: { box: "bg-admin-metric-indigo-bg", icon: "text-admin-badge-tech-text" },
  red: { box: "bg-admin-metric-red-bg", icon: "text-admin-badge-politics-text" },
};

type AdminMetricCardProps = {
  label: string;
  value: string;
  Icon: LucideIcon;
  iconTone: MetricIconTone;
  trend?: string;
  trendDirection?: "up" | "down";
  trendSuffix?: string | null;
  className?: string;
};

export function AdminMetricCard({
  label,
  value,
  Icon,
  iconTone,
  trend,
  trendDirection = "up",
  trendSuffix = "vs last week",
  className,
}: AdminMetricCardProps) {
  const tone = ICON_TONE_CLASSES[iconTone];
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;

  return (
    <article
      className={cn(
        "rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-admin-label">{label}</p>
          <p className="mt-1 text-[30px] font-bold leading-9 text-admin-heading">{value}</p>
          {trend ? (
            <div className="mt-3 flex flex-wrap items-center gap-1 text-sm">
              <TrendIcon
                className={cn(
                  "size-4",
                  trendDirection === "down" ? "text-admin-trend-down" : "text-admin-trend-up",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "font-medium",
                  trendDirection === "down" ? "text-admin-trend-down" : "text-admin-trend-up",
                )}
              >
                {trend}
              </span>
              {trendSuffix ? (
                <span className="text-admin-trend-muted">{trendSuffix}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-[10px]",
            tone.box,
          )}
        >
          <Icon className={cn("size-6", tone.icon)} aria-hidden />
        </span>
      </div>
    </article>
  );
}
