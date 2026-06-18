"use client";
import { useEffect, useRef, useState } from "react";

import type { AdminRevenueChart } from "@/services/admin/dashboard";

const CHART_H = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 44 };
const GROUP_GAP = 18;
const BAR_GAP = 6;

type RevenueAnalyticsChartProps = {
  title?: string;
  data?: AdminRevenueChart | null;
};

export function RevenueAnalyticsChart({ title = "Revenue Analytics", data }: RevenueAnalyticsChartProps) {
  const months = data?.labels ?? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const adRevenue = data?.ad_revenue ?? [0, 0, 0, 0, 0, 0];
  const subscriptions = data?.subscriptions ?? [0, 0, 0, 0, 0, 0];

  const maxValue = Math.max(...adRevenue, ...subscriptions, 1);
  const max = Math.ceil(maxValue / 1000) * 1000 || 1000;
  const yTicks = [0, max * 0.25, max * 0.5, max * 0.75, max].map((value) => Math.round(value));

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

  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const groupW = innerW / months.length;
  const barW = (groupW - GROUP_GAP) / 2 - BAR_GAP / 2;

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">{title}</h2>

      <div className="mt-4" ref={containerRef}>
        {width > 0 && (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Monthly revenue bar chart for ad revenue and subscriptions"
          >
            {yTicks.map((tick) => {
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
                    x={PAD.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={11}
                    fill="var(--admin-trend-muted)"
                  >
                    {tick === 0 ? "0" : tick >= 1000 ? `${tick / 1000}k` : String(tick)}
                  </text>
                </g>
              );
            })}

            {months.map((month, i) => {
              const groupX = PAD.left + i * groupW + GROUP_GAP / 2;
              const adH = (Math.min(adRevenue[i] ?? 0, max) / max) * innerH;
              const subH = (Math.min(subscriptions[i] ?? 0, max) / max) * innerH;
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
      </div>
    </section>
  );
}
