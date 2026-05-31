import type { ReactNode } from "react";
import { Clock, Eye, Bookmark, Share2, Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { userFeaturedStory } from "@/data/dummy/userDashboard";
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

export function UserFeaturedStory() {
  const story = userFeaturedStory;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-admin-heading">
        <Flame className="size-6 text-zbc-red" aria-hidden />
        <h2 className="text-xl font-semibold leading-7">Featured Story</h2>
      </div>

      <UserDashboardCard>
        <div className="relative h-44 overflow-hidden bg-zbc-gray-900 sm:h-56">
          <img
            src={story.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <UserCategoryBadge label={story.category} />
            <h3 className="line-clamp-2 text-xl font-semibold leading-7 text-white">
              {story.title}
            </h3>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-base leading-6 text-admin-label">{story.excerpt}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-admin-label">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {story.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" aria-hidden />
                {story.views.toLocaleString()}
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
            to="/news-details"
            className="inline-flex text-sm font-medium text-zbc-blue hover:underline"
          >
            Read full story
          </Link>
        </div>
      </UserDashboardCard>
    </div>
  );
}
