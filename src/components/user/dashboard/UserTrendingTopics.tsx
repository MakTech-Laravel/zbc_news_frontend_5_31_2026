import { TrendingUp } from "lucide-react";

import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import { userTrendingTopics, type UserTrendingTopic } from "@/data/dummy/userDashboard";

type UserTrendingTopicsProps = {
  topics?: UserTrendingTopic[];
};

export function UserTrendingTopics({ topics }: UserTrendingTopicsProps) {
  const displayTopics = topics ?? userTrendingTopics;

  return (
    <UserDashboardCard>
      <UserDashboardCardHeader
        title="Trending Topics"
        icon={<TrendingUp className="size-4" />}
      />
      {displayTopics.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-admin-label">No trending topics yet.</p>
      ) : (
        <ul className="divide-y divide-border px-2 py-2">
          {displayTopics.map((topic) => (
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
      )}
    </UserDashboardCard>
  );
}
