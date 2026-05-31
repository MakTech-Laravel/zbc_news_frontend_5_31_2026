import { useMemo, useState } from "react";
import { Globe } from "lucide-react";

import { UserHeroStoryCard } from "@/components/user/shared/UserHeroStoryCard";
import { UserSectionHeader } from "@/components/user/shared/UserSectionHeader";
import { WorldArticleList } from "@/components/user/world/WorldArticleList";
import { WorldInsightsGrid } from "@/components/user/world/WorldInsightsGrid";
import { WorldRegionTabs } from "@/components/user/world/WorldRegionTabs";
import {
  filterWorldArticles,
  worldArticles,
  worldHeroStory,
  worldRegionTabs,
  type WorldRegionId,
} from "@/data/dummy/worldNews";

export default function UserWorld() {
  const [activeRegion, setActiveRegion] = useState<WorldRegionId>("all");

  const filteredArticles = useMemo(
    () => filterWorldArticles(worldArticles, activeRegion),
    [activeRegion],
  );

  return (
    <div className="space-y-6 pb-8">
      <UserSectionHeader
        title="World News"
        description="Global coverage from every corner of the world"
        Icon={Globe}
      />

      <div className="border-l-4 border-zbc-breaking pl-1">
        <UserHeroStoryCard story={worldHeroStory} />
      </div>

      <WorldRegionTabs
        tabs={worldRegionTabs}
        activeId={activeRegion}
        onChange={setActiveRegion}
      />

      <div role="tabpanel" aria-label={activeRegion}>
        <WorldArticleList articles={filteredArticles} />
      </div>

      <WorldInsightsGrid onRegionSelect={setActiveRegion} />
    </div>
  );
}
