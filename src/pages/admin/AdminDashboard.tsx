import {
  Activity,
  CalendarClock,
  DollarSign,
  Eye,
  FileText,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AdminMetricCard } from "@/components/admin/dashboard/AdminMetricCard";
import { RecentArticlesCard } from "@/components/admin/dashboard/RecentArticlesCard";
import { RevenueAnalyticsChart } from "@/components/admin/dashboard/RevenueAnalyticsChart";
import { TopPerformingArticlesCard } from "@/components/admin/dashboard/TopPerformingArticlesCard";
import { TrafficOverviewChart } from "@/components/admin/dashboard/TrafficOverviewChart";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import type { MetricIconTone } from "@/components/admin/dashboard/AdminMetricCard";
import { useNavigate } from "react-router-dom";

const ICON_MAP: Record<string, LucideIcon> = {
  "Published Articles": FileText,
  "Active Users": Users,
  "Total Page Views": Eye,
  "Revenue (MTD)": DollarSign,
  "Draft Articles": FileText,
  "Scheduled Posts": CalendarClock,
  "Engagement Rate": Activity,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, loading } = useAdminDashboard();

  const primaryMetrics = data?.primary_metrics ?? [];
  const secondaryMetrics = data?.secondary_metrics ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome back, here's what's happening today"
        actionLabel="Create New Article"
        onAction={() => navigate("/admin/articles/create")}
      />

      <section className="grid gap-6 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[10px] border border-border bg-card" />
            ))
          : primaryMetrics.map((metric) => {
              const Icon = ICON_MAP[metric.label] ?? FileText;
              const trend = metric.trend;
              const trendDir = trend?.startsWith("-") ? "down" : "up";
              return (
                <AdminMetricCard
                  key={metric.label}
                  label={metric.label}
                  value={String(metric.value)}
                  Icon={Icon}
                  iconTone={metric.iconTone as MetricIconTone}
                  trend={trend}
                  trendDirection={trendDir}
                />
              );
            })}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-[10px] border border-border bg-card" />
            ))
          : secondaryMetrics.map((metric) => {
              const Icon = ICON_MAP[metric.label] ?? Activity;
              const trend = metric.trend;
              const trendDir = trend?.startsWith("-") ? "down" : "up";
              return (
                <AdminMetricCard
                  key={metric.label}
                  label={metric.label}
                  value={String(metric.value)}
                  Icon={Icon}
                  iconTone={metric.iconTone as MetricIconTone}
                  trend={trend}
                  trendDirection={trendDir}
                />
              );
            })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <TrafficOverviewChart data={data?.traffic_chart} />
          <RevenueAnalyticsChart data={data?.revenue_chart} />
        </div>
        <div className="space-y-6">
          <RecentArticlesCard articles={data?.recent_articles} loading={loading} />
          <TopPerformingArticlesCard articles={data?.top_articles} loading={loading} />
        </div>
      </section>
    </div>
  );
}
