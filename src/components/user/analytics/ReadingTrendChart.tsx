"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnalyticsChartCard } from "@/components/user/analytics/AnalyticsChartCard";
import type { MonthlyTrendItem } from "@/types/readingAnalytics";

const CHART_H = 274;
const PAD = { top: 12, right: 16, bottom: 32, left: 40 };

function buildChartScale(maxValue: number) {
  const max = Math.max(5, Math.ceil(maxValue / 4) * 4);
  const step = max / 4;
  const ticks = [0, step, step * 2, step * 3, max].map((tick) => Math.round(tick));
  return { max, ticks: [...new Set(ticks)] };
}

function toPoints(values: number[], width: number, max: number) {
  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const divisor = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = PAD.left + (index / divisor) * innerW;
      const y = PAD.top + innerH - (value / max) * innerH;
      return `${x},${y}`;
    })
    .join(" ");
}

type ReadingTrendChartProps = {
  data: MonthlyTrendItem[];
};

export function ReadingTrendChart({ data }: ReadingTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const values = useMemo(() => data.map((item) => item.count), [data]);
  const { max, ticks } = useMemo(() => {
    const peak = values.reduce((highest, value) => Math.max(highest, value), 0);
    return buildChartScale(peak);
  }, [values]);

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
  const points = width > 0 ? toPoints(values, width, max) : "";
  const divisor = Math.max(data.length - 1, 1);

  return (
    <AnalyticsChartCard title="Reading Trend" subtitle="Monthly articles read over time">
      <div ref={containerRef}>
        {width > 0 && data.length > 0 ? (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Line chart of monthly articles read"
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

            <polyline
              fill="none"
              stroke="#030213"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />

            {data.map((item, index) => {
              const x = PAD.left + (index / divisor) * innerW;
              const y = PAD.top + innerH - (item.count / max) * innerH;
              return (
                <g key={`${item.month}-${index}`}>
                  <circle cx={x} cy={y} r={4} fill="#030213" />
                  <text
                    x={x}
                    y={CHART_H - 10}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#717182"
                    fontFamily="Inter, sans-serif"
                  >
                    {item.month}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="flex h-[274px] items-center justify-center text-sm text-ink-muted">
            No monthly trend data yet.
          </div>
        )}
      </div>
    </AnalyticsChartCard>
  );
}
