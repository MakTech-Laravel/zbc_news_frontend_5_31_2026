import { Globe } from "lucide-react";

import { UserPersonalizedFeed } from "@/components/user/dashboard/UserPersonalizedFeed";
import { UserHeroStoryCard } from "@/components/user/shared/UserHeroStoryCard";
import { UserSectionHeader } from "@/components/user/shared/UserSectionHeader";
import { useWorldNews } from "@/hooks/useWorldNews";

export default function UserWorld() {
  const { data, loading, error } = useWorldNews();

  return (
    <div className="space-y-6 pb-8">
      <UserSectionHeader
        title="World News"
        description="Global coverage from every corner of the world"
        Icon={Globe}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="border-l-4 border-zbc-breaking pl-1">
        <UserHeroStoryCard story={data.featuredStory} loading={loading} />
      </div>

      <UserPersonalizedFeed
        title="World News Feed"
        feeds={data.feeds}
        loading={loading}
      />
    </div>
  );
}
