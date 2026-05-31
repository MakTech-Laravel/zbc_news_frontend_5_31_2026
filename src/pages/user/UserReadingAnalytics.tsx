import { UserPageShell } from "@/components/user/UserPageShell";
import { MostEngagedArticles } from "@/components/user/analytics/MostEngagedArticles";
import { ReadingCategoryChart } from "@/components/user/analytics/ReadingCategoryChart";
import { ReadingTrendChart } from "@/components/user/analytics/ReadingTrendChart";
import { WeeklyActivityChart } from "@/components/user/analytics/WeeklyActivityChart";
import { UserMetricCard } from "@/components/user/shared/UserMetricCard";
import { readingAnalyticsMetrics } from "@/data/dummy/readingAnalytics";

export default function UserReadingAnalytics() {
  return (
    <UserPageShell
      title="Reading Analytics"
      description="Track your reading habits and discover insights"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {readingAnalyticsMetrics.map((metric) => (
          <UserMetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            sublabel={metric.sublabel}
            icon={metric.icon}
            sublabelTone={metric.sublabelTone}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WeeklyActivityChart />
        <ReadingCategoryChart />
      </div>

      <ReadingTrendChart />

      <MostEngagedArticles />
    </UserPageShell>
  );
}
