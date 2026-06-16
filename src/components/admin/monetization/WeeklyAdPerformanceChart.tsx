"use client";
import { useEffect, useRef, useState } from "react";

import { formatCurrencyCents } from "@/services/admin/monetization";

const CHART_H = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 48 };

type WeeklyPerformancePoint = {
  label: string;
  impressions: number;
  revenue_cents: number;
};

type WeeklyAdPerformanceChartProps = {
  data: WeeklyPerformancePoint[];
};

function toPoints(values: number[], max: number, width: number) {
  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  if (values.length <= 1) {
    return values.map((v, i) => ({
      x: PAD.left + innerW / 2,
      y: PAD.top + innerH - (v / max) * innerH,
      i,
    }));
  }
  return values.map((v, i) => ({
    x: PAD.left + (i / (values.length - 1)) * innerW,
    y: PAD.top + innerH - (v / max) * innerH,
    i,
  }));
}

function buildTicks(max: number): number[] {
  if (max <= 0) return [0];
  const step = max <= 100 ? 25 : max <= 500 ? 100 : max <= 5000 ? 1000 : 5000;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) {
    ticks.push(v);
  }
  return ticks.length > 1 ? ticks : [0, top || 100];
}

export function WeeklyAdPerformanceChart({ data }: WeeklyAdPerformanceChartProps) {
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

  const impressions = data.map((row) => row.impressions);
  const revenue = data.map((row) => row.revenue_cents / 100);
  const labels = data.map((row) => row.label);

  const impressionsMax = Math.max(...impressions, 1) * 1.1;
  const revenueMax = Math.max(...revenue, 1) * 1.1;
  const impressionsPoints = toPoints(impressions, impressionsMax, width);
  const revenuePoints = toPoints(revenue, revenueMax, width);
  const impressionTicks = buildTicks(impressionsMax);
  const impressionChartMax = impressionTicks[impressionTicks.length - 1] || impressionsMax;

  const impressionsLine = impressionsPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const revenueLine = revenuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const innerH = CHART_H - PAD.top - PAD.bottom;
  const innerW = width - PAD.left - PAD.right;
  const hasData = data.some((row) => row.impressions > 0 || row.revenue_cents > 0);

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Weekly Ad Performance</h2>

      <div className="mt-4" ref={containerRef}>
        {width > 0 && hasData ? (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Weekly ad performance line chart for impressions and revenue"
          >
            {impressionTicks.map((tick) => {
              const y = PAD.top + innerH - (tick / impressionChartMax) * innerH;
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
                    {tick === 0 ? "0" : tick >= 1000 ? `${tick / 1000}k` : tick}
                  </text>
                </g>
              );
            })}

            <polyline
              fill="none"
              stroke="var(--admin-chart-purple)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={impressionsLine}
            />
            {impressionsPoints.map((p) => (
              <circle
                key={`imp-${labels[p.i]}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--admin-chart-purple)"
              />
            ))}

            <polyline
              fill="none"
              stroke="var(--admin-chart-green)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={revenueLine}
            />
            {revenuePoints.map((p) => (
              <circle
                key={`rev-${labels[p.i]}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--admin-chart-green)"
              />
            ))}

            {labels.map((day, i) => (
              <text
                key={day}
                x={
                  labels.length <= 1
                    ? PAD.left + innerW / 2
                    : PAD.left + (i / (labels.length - 1)) * innerW
                }
                y={CHART_H - 6}
                textAnchor="middle"
                fontSize={11}
                fill="var(--admin-trend-muted)"
              >
                {day}
              </text>
            ))}
          </svg>
        ) : (
          <p className="py-12 text-center text-sm text-admin-trend-muted">
            No ad performance data yet. Impressions on the site will appear here.
          </p>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm">
          <span className="inline-flex items-center gap-2 text-admin-chart-purple">
            <span className="size-3 rounded-full bg-admin-chart-purple" aria-hidden />
            Impressions
          </span>
          <span className="inline-flex items-center gap-2 text-admin-chart-green">
            <span className="size-3 rounded-full bg-admin-chart-green" aria-hidden />
            Revenue ({formatCurrencyCents(data.reduce((sum, row) => sum + row.revenue_cents, 0))} week)
          </span>
        </div>
      </div>
    </section>
  );
}
