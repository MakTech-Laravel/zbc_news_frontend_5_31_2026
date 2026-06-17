import { useAuth } from "@/auth/useAuth";
import { UserContinueReading } from "@/components/user/dashboard/UserContinueReading";
import { UserDashboardWelcome } from "@/components/user/dashboard/UserDashboardWelcome";
import { UserFeaturedStory } from "@/components/user/dashboard/UserFeaturedStory";
import { UserPersonalizedFeed } from "@/components/user/dashboard/UserPersonalizedFeed";
import { UserThisWeek } from "@/components/user/dashboard/UserThisWeek";
import { UserTrendingTopics } from "@/components/user/dashboard/UserTrendingTopics";
import { useBreakingNews } from "@/hooks/useBreakingNews";

export default function UserBreakingNews() {

  const { user } = useAuth();
  const { data, loading, error } = useBreakingNews();
  const displayName = user?.name ?? user?.email ?? "John Doe";

  return (

    <div className="space-y-6">
      <UserDashboardWelcome displayName={displayName} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,503px)]">
        <div className="space-y-6">
          <UserFeaturedStory story={loading ? undefined : data.featuredStory} />
          <UserPersonalizedFeed
            title="Breaking News Feed"
            feeds={data.feeds}
            loading={loading}
          />
        </div>
        <aside className="space-y-6">
          <UserContinueReading items={data.sidebar.continueReading} />
          <UserTrendingTopics topics={data.sidebar.trendingTopics} />
          <UserThisWeek stats={data.sidebar.thisWeek} />
        </aside>
      </div>
    </div>
  );

}

