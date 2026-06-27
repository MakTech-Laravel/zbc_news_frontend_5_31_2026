import { Clock, Eye, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ArticleSaveButton } from "@/components/articles/ArticleSaveButton";
import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import type { UserFeaturedStoryData } from "@/services/user/tagArticles";
import { formatCount } from "@/utils/format";

export type HeroStory = {
  id?: string;
  slug?: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  views?: number;
  imageUrl: string;
};

type UserHeroStoryCardProps = {
  story?: HeroStory | UserFeaturedStoryData | null;
  loading?: boolean;
};

export function UserHeroStoryCard({ story, loading = false }: UserHeroStoryCardProps) {
  if (loading) {
    return (
      <UserDashboardCard>
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-56 rounded-lg bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      </UserDashboardCard>
    );
  }

  if (!story) {
    return (
      <UserDashboardCard className="p-6 text-sm text-admin-label">
        No world news stories available right now.
      </UserDashboardCard>
    );
  }

  const articleHref = story.slug
    ? `/news-details/${encodeURIComponent(story.slug)}`
    : "/news-details";

  return (
    <UserDashboardCard>
      <div className="relative h-56 overflow-hidden bg-zbc-gray-900">
        {story.imageUrl ? (
          <img src={story.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-zbc-gray-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <UserCategoryBadge
            label={story.category}
            className="bg-zbc-gray-1000 py-0.5 px-1.5 font-inter text-xs font-medium text-zbc-gray-200"
          />
          <h2 className="line-clamp-2 font-inter text-xl font-semibold leading-7 text-white">
            {story.title}
          </h2>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="font-inter text-base font-normal leading-6 text-admin-label">{story.excerpt}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-admin-label">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {story.readTime}
            </span>
            {story.views !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" aria-hidden />
                {formatCount(story.views)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <ArticleSaveButton articleId={story.id} variant="card" />
            <button
              type="button"
              aria-label="Share"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-admin-label hover:bg-muted"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>
        <Link
          to={articleHref}
          className="inline-flex text-sm font-medium text-zbc-blue hover:underline"
        >
          Read full story
        </Link>
      </div>
    </UserDashboardCard>
  );
}
