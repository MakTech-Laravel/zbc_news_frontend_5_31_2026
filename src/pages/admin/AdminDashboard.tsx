import {
  Activity,
  CalendarClock,
  DollarSign,
  Eye,
  FileText,
  Users,
} from "lucide-react";

import { AdminMetricCard } from "@/components/admin/dashboard/AdminMetricCard";
import { RecentArticlesCard } from "@/components/admin/dashboard/RecentArticlesCard";
import { RevenueAnalyticsChart } from "@/components/admin/dashboard/RevenueAnalyticsChart";
import { TopPerformingArticlesCard } from "@/components/admin/dashboard/TopPerformingArticlesCard";
import { TrafficOverviewChart } from "@/components/admin/dashboard/TrafficOverviewChart";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import type { AdminMetricItem } from "@/services/admin/dashboard";
import { formatCount } from "@/utils/format";
import { useNavigate } from "react-router-dom";

const PRIMARY_METRICS = [
  {
    label: "Published Articles",
    value: "0",
    trend: "+0%",
    iconTone: "blue" as const,
    Icon: FileText,
  },
  {
    label: "Active Users",
    value: "0",
    trend: "+0%",
    iconTone: "green" as const,
    Icon: Users,
  },
  {
    label: "Total Page Views",
    value: "0",
    trend: "+0%",
    iconTone: "purple" as const,
    Icon: Eye,
  },
  {
    label: "Revenue (MTD)",
    value: "$0",
    trend: "+0%",
    iconTone: "orange" as const,
    Icon: DollarSign,
  },
];

const SECONDARY_METRICS = [
  {
    label: "Draft Articles",
    value: "0",
    iconTone: "yellow" as const,
    Icon: FileText,
  },
  {
    label: "Scheduled Posts",
    value: "0",
    iconTone: "indigo" as const,
    Icon: CalendarClock,
  },
  {
    label: "Engagement Rate",
    value: "0%",
    trend: "+0%",
    iconTone: "red" as const,
    Icon: Activity,
  },
];

function formatMetricValue(label: string, value: string | number): string {
  if (typeof value === "string") return value;
  if (label === "Total Page Views") return formatCount(value);
  return value.toLocaleString();
}

function mergeMetrics<T extends { label: string; value: string; trend?: string }>(
  base: T[],
  api: AdminMetricItem[] | undefined,
): T[] {
  if (!api?.length) return base;
  return base.map((metric) => {
    const fromApi = api.find((m) => m.label === metric.label);
    if (!fromApi) return metric;
    return {
      ...metric,
      value: formatMetricValue(metric.label, fromApi.value),
      ...(fromApi.trend !== undefined ? { trend: fromApi.trend } : {}),
    };
  });
}

function trendDirection(trend?: string): "up" | "down" {
  return trend?.trim().startsWith("-") ? "down" : "up";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data } = useAdminDashboard();

  const primaryMetrics = mergeMetrics(PRIMARY_METRICS, data?.primary_metrics);
  const secondaryMetrics = mergeMetrics(SECONDARY_METRICS, data?.secondary_metrics);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome back, here's what's happening today"
        actionLabel="Create New Article"
        onAction={() => navigate("/admin/articles/create")}
      />

      <section className="grid gap-6 xl:grid-cols-4">
        {primaryMetrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            {...metric}
            trendDirection={trendDirection(metric.trend)}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {secondaryMetrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            {...metric}
            trendDirection={trendDirection(metric.trend)}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <TrafficOverviewChart data={data?.traffic_chart} />
          <RevenueAnalyticsChart data={data?.revenue_chart} />
        </div>
        <div className="space-y-6">
          <RecentArticlesCard articles={data?.recent_articles} />
          <TopPerformingArticlesCard articles={data?.top_articles} />
        </div>
      </section>
    </div>
  );
}
