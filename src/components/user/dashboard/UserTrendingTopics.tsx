import { TrendingUp } from "lucide-react";

import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import { userTrendingTopics } from "@/data/dummy/userDashboard";

export function UserTrendingTopics() {
  return (
    <UserDashboardCard>
      <UserDashboardCardHeader
        title="Trending Topics"
        icon={<TrendingUp className="size-4" />}
      />
      <ul className="divide-y divide-border px-2 py-2">
        {userTrendingTopics.map((topic) => (
          <li
            key={topic.id}
            className="flex items-center justify-between gap-3 rounded-md px-4 py-2.5 hover:bg-muted/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-6 shrink-0 text-xs font-medium text-admin-label">
                {topic.rank}
              </span>
              <span className="truncate text-sm font-medium text-admin-heading">
                {topic.label}
              </span>
            </div>
            <span className="inline-flex h-[22px] shrink-0 items-center rounded bg-muted px-2 text-xs font-medium text-admin-label">
              {topic.count}
            </span>
          </li>
        ))}
      </ul>
    </UserDashboardCard>
  );
}
