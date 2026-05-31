"use client";
import { useEffect, useRef, useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const IMPRESSIONS = [48000, 52000, 55000, 60000, 68000, 62000, 70000];
const REVENUE = [1100, 1250, 1180, 1420, 1650, 1480, 1720];

const CHART_H = 220;
const PAD = { top: 12, right: 16, bottom: 28, left: 48 };

function toPoints(values: number[], max: number, width: number) {
  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  return values.map((v, i) => ({
    x: PAD.left + (i / (values.length - 1)) * innerW,
    y: PAD.top + innerH - (v / max) * innerH,
  }));
}

function maxValue(values: number[]) {
  return Math.max(...values) * 1.05;
}

const Y_TICKS = [0, 20000, 40000, 60000, 80000];

export function WeeklyAdPerformanceChart() {
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

  const impressionsMax = maxValue(IMPRESSIONS);
  const revenueMax = maxValue(REVENUE);
  const impressionsPoints = toPoints(IMPRESSIONS, impressionsMax, width);
  const revenuePoints = toPoints(REVENUE, revenueMax, width);

  const impressionsLine = impressionsPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const revenueLine = revenuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const innerH = CHART_H - PAD.top - PAD.bottom;
  const innerW = width - PAD.left - PAD.right;

  return (
    <section className="rounded-[10px] border border-border bg-card px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
      <h2 className="text-lg font-semibold text-admin-heading">Weekly Ad Performance</h2>

      <div className="mt-4" ref={containerRef}>
        {width > 0 && (
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width} ${CHART_H}`}
            role="img"
            aria-label="Weekly ad performance line chart for impressions and revenue"
          >
            {Y_TICKS.map((tick) => {
              const y = PAD.top + innerH - (tick / 80000) * innerH;
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

            {/* Impressions line + dots */}
            <polyline
              fill="none"
              stroke="var(--admin-chart-purple)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={impressionsLine}
            />
            {impressionsPoints.map((p, i) => (
              <circle
                key={`imp-${DAYS[i]}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--admin-chart-purple)"
              />
            ))}

            {/* Revenue line + dots */}
            <polyline
              fill="none"
              stroke="var(--admin-chart-green)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={revenueLine}
            />
            {revenuePoints.map((p, i) => (
              <circle
                key={`rev-${DAYS[i]}`}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--admin-chart-green)"
              />
            ))}

            {/* X axis labels */}
            {DAYS.map((day, i) => (
              <text
                key={day}
                x={PAD.left + (i / (DAYS.length - 1)) * innerW}
                y={CHART_H - 6}
                textAnchor="middle"
                fontSize={11}
                fill="var(--admin-trend-muted)"
              >
                {day}
              </text>
            ))}
          </svg>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-6 text-sm">
          <span className="inline-flex items-center gap-2 text-admin-chart-purple">
            <span className="size-3 rounded-full bg-admin-chart-purple" aria-hidden />
            Impressions
          </span>
          <span className="inline-flex items-center gap-2 text-admin-chart-green">
            <span className="size-3 rounded-full bg-admin-chart-green" aria-hidden />
            Revenue ($)
          </span>
        </div>
      </div>
    </section>
  );
}