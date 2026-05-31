"use client";
import { useEffect, useRef, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const VISITORS = [8200, 9100, 8800, 10200, 11500, 9800, 10800];
const PAGE_VIEWS = [10000, 12400, 11800, 13800, 15200, 13100, 14500];

const CHART_H = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 44 };
const Y_TICKS = [0, 4000, 8000, 12000, 16000];
const MAX = 16000;

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

export function TrafficOverviewChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const visitorsPoints = toPoints(VISITORS, width);
  const pageViewsPoints = toPoints(PAGE_VIEWS, width);

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">
        Traffic Overview
      </h2>

      <div className="mt-4" ref={containerRef}>
        <svg
         width="100%"
          height={CHART_H}
          role="img"
          aria-label="Weekly traffic line chart"
          viewBox={`0 0 ${width} ${CHART_H}`}
        >
          {/* Y axis grid + labels */}
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
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--admin-trend-muted)"
                >
                  {tick === 0 ? "0" : `${tick / 1000}k`}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <polyline
            fill="none"
            stroke="var(--admin-chart-blue)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={visitorsPoints}
          />
          <polyline
            fill="none"
            stroke="var(--admin-chart-purple)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pageViewsPoints}
          />

          {/* X axis labels */}
          {DAYS.map((day, i) => {
            const x = PAD.left + (i / (DAYS.length - 1)) * innerW;
            return (
              <text
                key={day}
                x={x}
                y={CHART_H - 6}
                textAnchor="middle"
                fontSize={11}
                fill="var(--admin-trend-muted)"
              >
                {day}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm">
          <span className="inline-flex items-center gap-2 text-admin-chart-blue">
            <span className="size-3 rounded-sm bg-admin-chart-blue" aria-hidden />
            Visitors
          </span>
          <span className="inline-flex items-center gap-2 text-admin-chart-purple">
            <span className="size-3 rounded-sm bg-admin-chart-purple" aria-hidden />
            Page Views
          </span>
        </div>
      </div>
    </section>
  );
}