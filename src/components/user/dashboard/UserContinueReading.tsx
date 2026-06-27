import { BookMarked, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { FreshnessIndicator } from "@/components/main-layout/shared/FreshnessIndicator";
import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import { userContinueReading, type UserContinueReadingItem } from "@/data/dummy/userDashboard";
import { getArticleFreshnessIso } from "@/lib/relativeTime";

type UserContinueReadingProps = {
  items?: UserContinueReadingItem[];
};

export function UserContinueReading({ items }: UserContinueReadingProps) {
  const displayItems = items ?? userContinueReading;

  return (
    <UserDashboardCard>
      <UserDashboardCardHeader
        title="Continue Reading"
        icon={<BookMarked className="size-4" />}
      />
      {displayItems.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-admin-label sm:px-6 sm:pb-6">
          No articles to continue reading.
        </p>
      ) : (
        <div className="space-y-3 p-4 sm:p-6">
          {displayItems.map((item) => {
            const freshnessIso = getArticleFreshnessIso(item);

            return (
            <Link
              key={item.id}
              to={
                item.slug
                  ? `/news-details/${encodeURIComponent(item.slug)}`
                  : "/news-details"
              }
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-zbc-blue/30 hover:bg-muted/30"
            >
              <UserCategoryBadge label={item.category} />
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-admin-heading sm:text-base">
                {item.title}
              </h3>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-admin-label">
                <Clock className="size-3 shrink-0" aria-hidden />
                {item.readTime}
                <span aria-hidden>·</span>
                {freshnessIso ? (
                  <FreshnessIndicator
                    dateTime={freshnessIso}
                    fallback={item.publishedAt}
                  />
                ) : (
                  item.publishedAt
                )}
              </p>
            </Link>
            );
          })}
        </div>
      )}
    </UserDashboardCard>
  );
}
