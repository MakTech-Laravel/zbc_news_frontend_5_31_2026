import type { ReactNode } from "react";
import { Clock, Eye, Bookmark, Share2, Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { userFeaturedStory } from "@/data/dummy/userDashboard";
import type { UserFeaturedStoryData } from "@/services/user/tagArticles";
import { cn } from "@/lib/utils";

function IconActionButton({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-admin-label transition-colors hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

type UserFeaturedStoryProps = {
  story?: UserFeaturedStoryData | null;
  loading?: boolean;
};

export function UserFeaturedStory({ story, loading = false }: UserFeaturedStoryProps) {
  const displayStory = story ?? userFeaturedStory;
  const articleHref = story?.slug
    ? `/news-details/${encodeURIComponent(story.slug)}`
    : "/news-details";

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-admin-heading">
          <Flame className="size-6 text-zbc-red" aria-hidden />
          <h2 className="text-xl font-semibold leading-7">Featured Story</h2>
        </div>
        <UserDashboardCard>
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-44 rounded-lg bg-muted sm:h-56" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </UserDashboardCard>
      </div>
    );
  }

  if (story === null) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-admin-heading">
          <Flame className="size-6 text-zbc-red" aria-hidden />
          <h2 className="text-xl font-semibold leading-7">Featured Story</h2>
        </div>
        <UserDashboardCard className="p-6 text-sm text-admin-label">
          No breaking news stories available right now.
        </UserDashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-admin-heading">
        <Flame className="size-6 text-zbc-red" aria-hidden />
        <h2 className="text-xl font-semibold leading-7">Featured Story</h2>
      </div>

      <UserDashboardCard>
        <div className="relative h-44 overflow-hidden bg-zbc-gray-900 sm:h-56">
          {displayStory.imageUrl ? (
            <img
              src={displayStory.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-zbc-gray-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <UserCategoryBadge label={displayStory.category} />
            <h3 className="line-clamp-2 text-xl font-semibold leading-7 text-white">
              {displayStory.title}
            </h3>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-base leading-6 text-admin-label">{displayStory.excerpt}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-admin-label">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {displayStory.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" aria-hidden />
                {displayStory.views.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconActionButton label="Save article">
                <Bookmark className="size-4" />
              </IconActionButton>
              <IconActionButton label="Share article">
                <Share2 className="size-4" />
              </IconActionButton>
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
    </div>
  );
}
