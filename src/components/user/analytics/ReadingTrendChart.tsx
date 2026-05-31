"use client";

import { useEffect, useRef, useState } from "react";

import { AnalyticsChartCard } from "@/components/user/analytics/AnalyticsChartCard";
import { readingTrendData } from "@/data/dummy/readingAnalytics";

const CHART_H = 274;
const PAD = { top: 12, right: 16, bottom: 32, left: 40 };
const MAX = 80;
const Y_TICKS = [0, 20, 40, 60, 80];

function toPoints(values: number[], width: number) {
  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  return values
    .map((v, i) => {
      const x = PAD.left + (i / (values.length - 1)) * innerW;
      const y = PAD.top + innerH - (v / MAX) * innerH;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ReadingTrendChart() {
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

  const values = readingTrendData.map((d) => d.articles);
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const points = width > 0 ? toPoints(values, width) : "";

  return (
    <AnalyticsChartCard title="Reading Trend" subtitle="Monthly articles read over time">
      <div ref={containerRef}>
        {width > 0 ? (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Line chart of monthly articles read"
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

            <polyline
              fill="none"
              stroke="#030213"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />

            {readingTrendData.map((item, i) => {
              const x = PAD.left + (i / (readingTrendData.length - 1)) * innerW;
              const y = PAD.top + innerH - (item.articles / MAX) * innerH;
              return (
                <g key={item.month}>
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
          <div className="h-[274px]" aria-hidden />
        )}
      </div>
    </AnalyticsChartCard>
  );
}
