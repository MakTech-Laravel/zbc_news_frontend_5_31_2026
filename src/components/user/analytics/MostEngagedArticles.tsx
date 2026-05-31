import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { mostEngagedArticles } from "@/data/dummy/readingAnalytics";

export function MostEngagedArticles() {
  return (
    <UserDashboardCard className="rounded-[14px] border-black/10">
      <div className="space-y-1 px-6 pb-2 pt-6">
        <h3 className="font-inter text-base font-medium text-ink-heading">Most Engaged Articles</h3>
        <p className="font-inter text-base text-ink-muted">Your top reads this month</p>
      </div>

      <ul className="space-y-4 px-6 pb-6">
        {mostEngagedArticles.map((article) => (
          <li key={article.id} className="space-y-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-inter text-xs font-medium text-ink-muted">
                    #{article.rank}
                  </span>
                  <span className="inline-flex rounded-lg bg-[#ECEEF2] px-2.5 py-0.5 font-inter text-xs font-medium text-[#030213]">
                    {article.category}
                  </span>
                </div>
                <Link
                  to="/news-details"
                  className="block font-inter text-sm font-medium leading-5 text-ink-heading transition-colors hover:text-brand-deep"
                >
                  {article.title}
                </Link>
                <p className="inline-flex items-center gap-1 font-inter text-xs text-ink-muted">
                  <Clock className="size-3 shrink-0" aria-hidden />
                  {article.readTime}
                </p>
              </div>
              <div className="shrink-0 text-right sm:pl-4">
                <p className="font-inter text-sm font-medium text-ink-heading">
                  {article.completionPercent}%
                </p>
                <p className="font-inter text-xs text-ink-muted">completed</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#ECECF0]">
              <div
                className="h-full rounded-full bg-[#030213] transition-all"
                style={{ width: `${article.completionPercent}%` }}
                role="progressbar"
                aria-valuenow={article.completionPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${article.completionPercent}% completed`}
              />
            </div>
          </li>
        ))}
      </ul>
    </UserDashboardCard>
  );
}
