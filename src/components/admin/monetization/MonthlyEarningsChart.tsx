"use client";
import { useEffect, useRef, useState } from "react";

import { formatCurrencyCents } from "@/services/admin/monetization";

const CHART_H = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 44 };
const GROUP_GAP = 18;
const BAR_GAP = 6;

type MonthlyEarningsPoint = {
  label: string;
  ad_revenue_cents: number;
  subscription_revenue_cents: number;
};

type MonthlyEarningsChartProps = {
  data: MonthlyEarningsPoint[];
};

function buildTicks(max: number): number[] {
  if (max <= 0) return [0];
  const step = max <= 4000 ? 1000 : max <= 20000 ? 5000 : 10000;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) {
    ticks.push(v);
  }
  return ticks.length > 1 ? ticks : [0, top || 1000];
}

export function MonthlyEarningsChart({ data }: MonthlyEarningsChartProps) {
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

  const adRevenue = data.map((row) => row.ad_revenue_cents / 100);
  const subscriptions = data.map((row) => row.subscription_revenue_cents / 100);
  const labels = data.map((row) => row.label);
  const max = Math.max(...adRevenue, ...subscriptions, 1) * 1.1;
  const yTicks = buildTicks(max);

  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const groupW = labels.length > 0 ? innerW / labels.length : innerW;
  const barW = (groupW - GROUP_GAP) / 2 - BAR_GAP / 2;
  const chartMax = yTicks[yTicks.length - 1] || max;

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Monthly Earnings</h2>

      <div className="mt-4" ref={containerRef}>
        {width > 0 && labels.length > 0 ? (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Monthly earnings bar chart for ad revenue and subscriptions"
          >
            {yTicks.map((tick) => {
              const y = PAD.top + innerH - (tick / chartMax) * innerH;
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

            {labels.map((month, i) => {
              const groupX = PAD.left + i * groupW + GROUP_GAP / 2;
              const adH = (adRevenue[i] / chartMax) * innerH;
              const subH = (subscriptions[i] / chartMax) * innerH;
              const baseY = PAD.top + innerH;

              return (
                <g key={month}>
                  <rect
                    x={groupX}
                    y={baseY - adH}
                    width={barW}
                    height={adH}
                    rx={4}
                    fill="var(--admin-chart-blue)"
                  />
                  <rect
                    x={groupX + barW + BAR_GAP}
                    y={baseY - subH}
                    width={barW}
                    height={subH}
                    rx={4}
                    fill="var(--admin-chart-green)"
                  />
                  <text
                    x={groupX + barW + BAR_GAP / 2}
                    y={CHART_H - 6}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--admin-trend-muted)"
                  >
                    {month}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <p className="py-12 text-center text-sm text-admin-trend-muted">
            No earnings data yet. Ad impressions and newsletter signups will populate this chart.
          </p>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm">
          <span className="inline-flex items-center gap-2 text-admin-chart-blue">
            <span className="size-3 rounded-sm bg-admin-chart-blue" aria-hidden />
            Ad Revenue
          </span>
          <span className="inline-flex items-center gap-2 text-admin-chart-green">
            <span className="size-3 rounded-sm bg-admin-chart-green" aria-hidden />
            Subscriptions
          </span>
        </div>
        {data.length > 0 ? (
          <p className="mt-2 text-center text-xs text-admin-trend-muted">
            Latest month ad revenue: {formatCurrencyCents(data[data.length - 1]?.ad_revenue_cents ?? 0)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
