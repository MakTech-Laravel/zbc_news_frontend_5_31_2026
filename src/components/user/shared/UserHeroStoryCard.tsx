import { Clock, Eye, Bookmark, Share2 } from "lucide-react";

import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";

export type HeroStory = {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  views?: number;
  imageUrl: string;
};

type UserHeroStoryCardProps = {
  story: HeroStory;
};

export function UserHeroStoryCard({ story }: UserHeroStoryCardProps) {
  return (
    <UserDashboardCard>
      <div className="relative h-56 overflow-hidden bg-zbc-gray-900">
        <img src={story.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <UserCategoryBadge label={story.category} className="bg-zbc-gray-1000 text-zbc-gray-200 font-inter text-xs font-medium py-0.5 px-1.5" />
          <h2 className="line-clamp-2 text-xl font-semibold leading-7 text-white font-inter">{story.title}</h2>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-base leading-6 text-admin-label font-inter font-normal">{story.excerpt}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-admin-label">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {story.readTime}
            </span>
            {story.views !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" aria-hidden />
                {story.views.toLocaleString()}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Save"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-admin-label hover:bg-muted"
            >
              <Bookmark className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Share"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-admin-label hover:bg-muted"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </UserDashboardCard>
  );
}
