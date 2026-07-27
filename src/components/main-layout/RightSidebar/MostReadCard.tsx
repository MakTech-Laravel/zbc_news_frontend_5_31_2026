import { useState } from "react";
import { Link } from "react-router-dom";
import { ChartNoAxesColumn, Eye } from "lucide-react";

import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import { useMostReadArticles } from "@/hooks/useMostReadArticles";
import { cn } from "@/lib/utils";
import type { MostReadPeriod } from "@/services/frontend/articles";
import { formatCount } from "@/utils/format";

const PERIOD_OPTIONS: { value: MostReadPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All" },
];

export function MostReadCard() {
  const [period, setPeriod] = useState<MostReadPeriod>("today");
  const { articles, loading, loadingMore, hasMore, loadMore } =
    useMostReadArticles(period);

  return (
    <SidebarCard className="rounded-xs bg-surface-soft p-0!">
      <div className="border-b-2 border-border p-4 pb-3">
        <div className="mb-3 flex items-center gap-2">
          <ChartNoAxesColumn className="size-5 text-primary" />
          <h2 className="font-inter text-sm font-bold text-zbc-gray-1000">Most Read</h2>
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Most read period">
          {PERIOD_OPTIONS.map((option) => {
            const selected = period === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setPeriod(option.value)}
                className={cn(
                  "rounded-sm px-2 py-1 font-inter text-[11px] font-semibold transition-colors",
                  selected
                    ? "bg-primary text-white"
                    : "text-zbc-gray-500 hover:text-primary",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="h-70 animate-pulse bg-muted/60" />
      ) : articles.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground">No articles yet.</p>
      ) : (
        <>
          <ol>
            {articles.map((article, index) => (
              <li
                key={article.id}
                className="flex gap-3 border-b-2 border-border p-4 last:border-b-0"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-sm font-inter text-2xl font-extrabold text-primary/20">
                  {index + 1}
                </span>
                <div>
                  <Link
                    to={
                      article.slug
                        ? `/${encodeURIComponent(article.slug)}`
                        : "/"
                    }
                    className="line-clamp-3 font-inter text-xs font-semibold leading-snug text-zbc-gray-1000 hover:text-primary"
                  >
                    {article.title}
                  </Link>
                  <span className="mt-1 flex items-center gap-1">
                    <Eye className="size-4 text-zbc-gray-500" />
                    <span className="font-inter text-xs text-zbc-gray-500">
                      {formatCount(article.views ?? 0)}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ol>

          {hasMore ? (
            <div className="border-t-2 border-border p-3 text-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="font-inter text-xs font-semibold text-primary hover:underline disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </SidebarCard>
  );
}
