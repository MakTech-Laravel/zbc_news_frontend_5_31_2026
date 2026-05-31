import { AnalyticsChartCard } from "@/components/user/analytics/AnalyticsChartCard";
import { readingCategoryData } from "@/data/dummy/readingAnalytics";

function buildConicGradient() {
  let cursor = 0;
  const stops = readingCategoryData.map((item) => {
    const start = cursor;
    cursor += item.percent;
    return `${item.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

export function ReadingCategoryChart() {
  const gradient = buildConicGradient();

  return (
    <AnalyticsChartCard
      title="Reading by Category"
      subtitle="Distribution of your interests"
    >
      <div className="flex flex-col items-center w-full gap-6">
        {/* Donut Chart — responsive via clamp/aspect-ratio */}
        <div
          className="relative shrink-0 rounded-full"
          style={{ width: "min(220px, 60vw)", height: "min(220px, 60vw)" }}
          role="img"
          aria-label="Donut chart of reading interests by category"
        >
          <div
            className="size-full rounded-full"
            style={{ background: gradient }}
          />
          {/* Inner hole */}
          <div className="absolute inset-[22%] rounded-full bg-white" />
        </div>

        {/* Legend */}
        <ul className="w-full grid grid-cols-2 gap-x-6 gap-y-3 px-1">
          {readingCategoryData.map((item) => (
            <li key={item.id} className="flex items-center gap-2 min-w-0">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="font-inter text-xs text-ink-muted truncate">
                {item.label}{" "}
                <span className="text-ink-subtle">({item.percent}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </AnalyticsChartCard>
  );
}