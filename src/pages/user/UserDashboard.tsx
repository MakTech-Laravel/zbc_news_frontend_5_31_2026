import { useAuth } from "@/auth/useAuth";
import { UserContinueReading } from "@/components/user/dashboard/UserContinueReading";
import { UserDashboardWelcome } from "@/components/user/dashboard/UserDashboardWelcome";
import { UserFeaturedStory } from "@/components/user/dashboard/UserFeaturedStory";
import { UserPersonalizedFeed } from "@/components/user/dashboard/UserPersonalizedFeed";
import { UserThisWeek } from "@/components/user/dashboard/UserThisWeek";
import { UserTrendingTopics } from "@/components/user/dashboard/UserTrendingTopics";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import type { UserFeaturedStoryData } from "@/services/user/tagArticles";

export default function UserDashboard() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email ?? "John Doe";
  const { data, loading } = useUserDashboard();

  // Map API featured story to the shape UserFeaturedStory expects
  const featuredStory: UserFeaturedStoryData | null | undefined = loading
    ? undefined
    : data?.featured_story
    ? {
        id: String(data.featured_story.id),
        title: data.featured_story.title,
        slug: data.featured_story.slug,
        excerpt: data.featured_story.excerpt,
        imageUrl: data.featured_story.imageUrl,
        category: data.featured_story.category,
        readTime: data.featured_story.readTime,
        views: data.featured_story.views,
      }
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <UserDashboardWelcome displayName={displayName} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,503px)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <UserFeaturedStory story={featuredStory} loading={loading} />
          <UserPersonalizedFeed
            feeds={data?.feeds}
            loading={loading}
          />
        </div>

        <aside className="space-y-4 sm:space-y-6 xl:sticky xl:top-4 xl:max-h-[calc(100dvh-var(--user-header-height,68px)-2rem)] xl:overflow-y-auto xl:scrollbar-hide xl:self-start">
          <UserContinueReading items={data?.continue_reading} />
          <UserTrendingTopics topics={data?.trending_topics} />
          <UserThisWeek stats={data?.this_week} />
        </aside>
      </div>
    </div>
  );
}
