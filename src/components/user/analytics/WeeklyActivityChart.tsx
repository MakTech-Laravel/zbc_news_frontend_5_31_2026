"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnalyticsChartCard } from "@/components/user/analytics/AnalyticsChartCard";
import type { WeeklyActivityItem } from "@/types/readingAnalytics";

const CHART_H = 250;
const PAD = { top: 8, right: 12, bottom: 32, left: 36 };

function buildChartScale(maxValue: number) {
  const max = Math.max(5, Math.ceil(maxValue / 4) * 4);
  const step = max / 4;
  const ticks = [0, step, step * 2, step * 3, max].map((tick) => Math.round(tick));
  return { max, ticks: [...new Set(ticks)] };
}

type WeeklyActivityChartProps = {
  data: WeeklyActivityItem[];
};

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const { max, ticks } = useMemo(() => {
    const peak = data.reduce((highest, item) => Math.max(highest, item.count), 0);
    return buildChartScale(peak);
  }, [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const barW = data.length > 0 ? innerW / data.length - 12 : 0;

  return (
    <AnalyticsChartCard title="Weekly Activity" subtitle="Articles read per day">
      <div ref={containerRef}>
        {width > 0 && data.length > 0 ? (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Bar chart of articles read per day this week"
          >
            {ticks.map((tick) => {
              const y = PAD.top + innerH - (tick / max) * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    x2={width - PAD.right}
                    y1={y}
                    y2={y}
                    stroke="var(--zbc-gray-200)"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD.left - 6}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={12}
                    fill="#717182"
                    fontFamily="Inter, sans-serif"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {data.map((item, i) => {
              const barH = max > 0 ? (item.count / max) * innerH : 0;
              const x = PAD.left + i * (innerW / data.length) + 6;
              const y = PAD.top + innerH - barH;
              return (
                <g key={item.day}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={4}
                    fill="#030213"
                  />
                  <text
                    x={x + barW / 2}
                    y={CHART_H - 10}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#717182"
                    fontFamily="Inter, sans-serif"
                  >
                    {item.day}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-ink-muted">
            No weekly activity yet.
          </div>
        )}
      </div>
    </AnalyticsChartCard>
  );
}
