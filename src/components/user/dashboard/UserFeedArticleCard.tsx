import * as React from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { ArticleSaveButton } from "@/components/articles/ArticleSaveButton";
import { ArticleShareButton } from "@/components/articles/ArticleShareButton";
import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import type { UserFeedArticle } from "@/types/user";
import { cn } from "@/lib/utils";

export type UserFeedArticleCardDensity = "default" | "compact";

type UserFeedArticleCardProps = {
  article: UserFeedArticle;
  href?: string;
  density?: UserFeedArticleCardDensity;
  className?: string;
};

function UserFeedArticleCardComponent({
  article,
  href,
  density = "default",
  className,
}: UserFeedArticleCardProps) {
  const articleHref =
    href ?? (article.slug ? `/news-details/${encodeURIComponent(article.slug)}` : "/news-details");
  const isCompact = density === "compact";

  return (
    <UserDashboardCard className={className}>
      <article className={cn("space-y-3", isCompact ? "p-4 sm:p-5" : "p-4 sm:p-5")}>
        <div className="flex flex-wrap items-center gap-2">
          <UserCategoryBadge
            label={article.category}
            className="bg-zbc-gray-200 py-0.5 font-inter text-xs font-medium text-zbc-gray-1000"
          />
          <span className="text-xs text-admin-label">{article.publishedAt}</span>
        </div>

        <Link
          to={articleHref}
          className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h2
            className={cn(
              "font-inter font-semibold text-admin-heading transition-colors hover:text-brand-deep",
              isCompact
                ? "text-base leading-6 sm:text-lg sm:leading-7"
                : "text-lg leading-7 sm:text-2xl sm:leading-8",
            )}
          >
            {article.title}
          </h2>
        </Link>

        <p
          className={cn(
            "line-clamp-2 text-admin-label",
            isCompact ? "text-sm leading-5" : "text-sm leading-5 sm:text-[15px]",
          )}
        >
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <p className="text-sm text-admin-label">
            <span className="font-medium text-admin-heading">{article.author}</span>
            <span className="mx-2" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 shrink-0" aria-hidden />
              {article.readTime}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <ArticleSaveButton articleId={article.id} variant="card" />
            <ArticleShareButton
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt}
              imageUrl={article.imageUrl}
            />
          </div>
        </div>
      </article>
    </UserDashboardCard>
  );
}

export const UserFeedArticleCard = React.memo(UserFeedArticleCardComponent);
