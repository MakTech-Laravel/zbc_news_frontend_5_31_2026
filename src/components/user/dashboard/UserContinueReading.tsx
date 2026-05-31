import { BookMarked, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import { userContinueReading } from "@/data/dummy/userDashboard";

export function UserContinueReading() {
  return (
    <UserDashboardCard>
      <UserDashboardCardHeader
        title="Continue Reading"
        icon={<BookMarked className="size-4" />}
      />
      <div className="space-y-3 p-4 sm:p-6">
        {userContinueReading.map((item) => (
          <Link
            key={item.id}
            to="/news-details"
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
              {item.publishedAt}
            </p>
          </Link>
        ))}
      </div>
    </UserDashboardCard>
  );
}
