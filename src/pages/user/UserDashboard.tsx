import { useAuth } from "@/auth/useAuth";
import { UserContinueReading } from "@/components/user/dashboard/UserContinueReading";
import { UserDashboardWelcome } from "@/components/user/dashboard/UserDashboardWelcome";
import { UserFeaturedStory } from "@/components/user/dashboard/UserFeaturedStory";
import { UserPersonalizedFeed } from "@/components/user/dashboard/UserPersonalizedFeed";
import { UserThisWeek } from "@/components/user/dashboard/UserThisWeek";
import { UserTrendingTopics } from "@/components/user/dashboard/UserTrendingTopics";

export default function UserDashboard() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "John Doe";

  return (
    <div className="space-y-4 sm:space-y-6">
      <UserDashboardWelcome displayName={displayName} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,503px)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <UserFeaturedStory />
          <UserPersonalizedFeed />
        </div>

        <aside className="space-y-4 sm:space-y-6 xl:sticky xl:top-4 xl:max-h-[calc(100dvh-var(--user-header-height,68px)-2rem)] xl:overflow-y-auto xl:scrollbar-hide xl:self-start">
          <UserContinueReading />
          <UserTrendingTopics />
          <UserThisWeek />
        </aside>
      </div>
    </div>
  );
}
