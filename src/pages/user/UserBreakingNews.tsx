import { useAuth } from "@/auth/useAuth";
import { UserContinueReading } from "@/components/user/dashboard/UserContinueReading";
import { UserDashboardWelcome } from "@/components/user/dashboard/UserDashboardWelcome";
import { UserFeaturedStory } from "@/components/user/dashboard/UserFeaturedStory";
import { UserPersonalizedFeed } from "@/components/user/dashboard/UserPersonalizedFeed";
import { UserThisWeek } from "@/components/user/dashboard/UserThisWeek";
import { UserTrendingTopics } from "@/components/user/dashboard/UserTrendingTopics";

/** Figma Breaking News uses the same hub layout as Dashboard */
export default function UserBreakingNews() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "John Doe";

  return (
    <div className="space-y-6">
      <UserDashboardWelcome displayName={displayName} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,503px)]">
        <div className="space-y-6">
          <UserFeaturedStory />
          <UserPersonalizedFeed />
        </div>

        <aside className="space-y-6">
          <UserContinueReading />
          <UserTrendingTopics />
          <UserThisWeek />
        </aside>
      </div>
    </div>
  );
}
