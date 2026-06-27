import type { ReactNode } from "react";
import { useState } from "react";
import { Clock, Eye, Share2, Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { ArticleSaveButton } from "@/components/articles/ArticleSaveButton";
import { ArticleShareModal } from "@/components/articles/ArticleShareModal";
import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { userFeaturedStory } from "@/data/dummy/userDashboard";
import type { UserFeaturedStoryData } from "@/services/user/tagArticles";
import { cn } from "@/lib/utils";
import { formatCount } from "@/utils/format";

function IconActionButton({
  label,
  children,
  className,
  onClick,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
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
};

export function UserFeaturedStory({ story }: UserFeaturedStoryProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const displayStory = story ?? userFeaturedStory;
  const articleHref = story?.slug
    ? `/news-details/${encodeURIComponent(story.slug)}`
    : "/news-details";
  const articleId = story?.id;

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
                {formatCount(displayStory.views)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArticleSaveButton articleId={articleId} variant="card" />
              <IconActionButton label="Share article" onClick={() => setShareOpen(true)}>
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

      <ArticleShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        slug={story?.slug}
        title={displayStory.title}
        summary={displayStory.excerpt}
        imageUrl={displayStory.imageUrl}
      />
    </div>
  );
}
