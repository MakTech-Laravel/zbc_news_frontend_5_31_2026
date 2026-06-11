import { AnalyticsChartCard } from "@/components/user/analytics/AnalyticsChartCard";
import type { ReadingCategoryItem } from "@/types/readingAnalytics";

function buildConicGradient(data: ReadingCategoryItem[]) {
  let cursor = 0;
  const stops = data.map((item) => {
    const start = cursor;
    cursor += item.percent;
    return `${item.color} ${start}% ${cursor}%`;
  });
  return stops.length > 0 ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#ECECF0 0% 100%)";
}

type ReadingCategoryChartProps = {
  data: ReadingCategoryItem[];
};

export function ReadingCategoryChart({ data }: ReadingCategoryChartProps) {
  const gradient = buildConicGradient(data);

  return (
    <AnalyticsChartCard
      title="Reading by Category"
      subtitle="Distribution of your interests"
    >
      {data.length > 0 ? (
        <div className="flex w-full flex-col items-center gap-6">
          <div
            className="relative shrink-0 rounded-full"
            style={{ width: "min(220px, 60vw)", height: "min(220px, 60vw)" }}
            role="img"
            aria-label="Donut chart of reading interests by category"
          >
            <div className="size-full rounded-full" style={{ background: gradient }} />
            <div className="absolute inset-[22%] rounded-full bg-white" />
          </div>

          <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-3 px-1">
            {data.map((item) => (
              <li key={item.id} className="flex min-w-0 items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="truncate font-inter text-xs text-ink-muted">
                  {item.label}{" "}
                  <span className="text-ink-subtle">({item.percent}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-ink-muted">
          No category data yet.
        </div>
      )}
    </AnalyticsChartCard>
  );
}
