"use client";

import { useEffect, useRef, useState } from "react";

import { AnalyticsChartCard } from "@/components/user/analytics/AnalyticsChartCard";
import { weeklyActivityData } from "@/data/dummy/readingAnalytics";

const CHART_H = 250;
const PAD = { top: 8, right: 12, bottom: 32, left: 36 };
const MAX = 12;
const Y_TICKS = [0, 3, 6, 9, 12];

export function WeeklyActivityChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

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
  const barW = innerW / weeklyActivityData.length - 12;

  return (
    <AnalyticsChartCard title="Weekly Activity" subtitle="Articles read per day">
      <div ref={containerRef}>
        {width > 0 ? (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Bar chart of articles read per day this week"
          >
            {Y_TICKS.map((tick) => {
              const y = PAD.top + innerH - (tick / MAX) * innerH;
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

            {weeklyActivityData.map((item, i) => {
              const barH = (item.articles / MAX) * innerH;
              const x = PAD.left + i * (innerW / weeklyActivityData.length) + 6;
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
          <div className="h-[250px]" aria-hidden />
        )}
      </div>
    </AnalyticsChartCard>
  );
}
