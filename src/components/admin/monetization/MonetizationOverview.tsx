import * as React from "react";
import { DollarSign, Eye, Loader2, MousePointerClick } from "lucide-react";

import { AdminMetricCard } from "@/components/admin/dashboard/AdminMetricCard";
import { AdPlacementManager } from "@/components/admin/monetization/AdPlacementManager";
import { MonthlyEarningsChart } from "@/components/admin/monetization/MonthlyEarningsChart";
import { WeeklyAdPerformanceChart } from "@/components/admin/monetization/WeeklyAdPerformanceChart";
import {
  fetchMonetizationOverview,
  formatMonetizationMetric,
  formatTrendPercent,
  type MonetizationOverview,
} from "@/services/admin/monetization";

export function MonetizationOverview() {
  const [overview, setOverview] = React.useState<MonetizationOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOverview = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMonetizationOverview();
      setOverview(data);
    } catch {
      setError("Failed to load monetization overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-6 py-10 text-sm text-admin-label">
        <Loader2 className="size-4 animate-spin" />
        Loading monetization overview…
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-[10px] border border-border bg-card px-6 py-10 text-sm text-destructive">
        {error ?? "No overview data available."}
      </div>
    );
  }

  const { metrics } = overview;

  return (
    <>
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Today's Revenue"
          value={formatMonetizationMetric(metrics.today_revenue)}
          trend={formatTrendPercent(metrics.today_revenue)}
          trendDirection={metrics.today_revenue.trend_direction}
          trendSuffix="vs yesterday"
          iconTone="green"
          Icon={DollarSign}
        />
        <AdminMetricCard
          label="This Week"
          value={formatMonetizationMetric(metrics.week_revenue)}
          trend={formatTrendPercent(metrics.week_revenue)}
          trendDirection={metrics.week_revenue.trend_direction}
          trendSuffix="vs last week"
          iconTone="blue"
          Icon={DollarSign}
        />
        <AdminMetricCard
          label="Monthly Impressions"
          value={formatMonetizationMetric(metrics.total_impressions)}
          trend={formatTrendPercent(metrics.total_impressions)}
          trendDirection={metrics.total_impressions.trend_direction}
          trendSuffix="vs last month"
          iconTone="purple"
          Icon={Eye}
        />
        <AdminMetricCard
          label="Average CTR"
          value={formatMonetizationMetric(metrics.average_ctr)}
          trend={formatTrendPercent(metrics.average_ctr)}
          trendDirection={metrics.average_ctr.trend_direction}
          trendSuffix="vs last month"
          iconTone="orange"
          Icon={MousePointerClick}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MonthlyEarningsChart data={overview.monthly_earnings} />
        <WeeklyAdPerformanceChart data={overview.weekly_performance} />
      </section>

      <AdPlacementManager placements={overview.placements} onRefresh={loadOverview} />
    </>
  );
}
