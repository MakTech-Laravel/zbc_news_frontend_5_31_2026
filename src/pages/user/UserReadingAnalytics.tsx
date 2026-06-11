import { MostEngagedArticles } from "@/components/user/analytics/MostEngagedArticles";
import { ReadingCategoryChart } from "@/components/user/analytics/ReadingCategoryChart";
import { ReadingTrendChart } from "@/components/user/analytics/ReadingTrendChart";
import { WeeklyActivityChart } from "@/components/user/analytics/WeeklyActivityChart";
import { UserPageShell } from "@/components/user/UserPageShell";
import { UserMetricCard } from "@/components/user/shared/UserMetricCard";
import { useReadingAnalytics } from "@/hooks/useReadingAnalytics";

export default function UserReadingAnalytics() {
  const { data, loading, error } = useReadingAnalytics();

  return (
    <UserPageShell
      title="Reading Analytics"
      description="Track your reading habits and discover insights"
    >
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-admin-label">Loading reading analytics…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((metric) => (
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
            <WeeklyActivityChart data={data.weeklyActivity} />
            <ReadingCategoryChart data={data.byCategory} />
          </div>

          <ReadingTrendChart data={data.monthlyTrend} />

          <MostEngagedArticles articles={data.mostEngaged} />
        </>
      )}
    </UserPageShell>
  );
}
