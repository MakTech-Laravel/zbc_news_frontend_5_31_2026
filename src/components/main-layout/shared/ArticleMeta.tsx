import { Link } from "react-router-dom";
import { EyeIcon, MessageSquare } from "lucide-react";

import { ArticleTimestamps } from "@/components/articles/ArticleTimestamps";
import { cn } from "@/lib/utils";
import { formatCount } from "@/utils/format";

type ArticleMetaProps = {
  author: string;
  readTime: string;
  views?: number;
  commentCount?: number;
  commentHref?: string;
  publishedAt?: string;
  publishedAtIso?: string;
  updatedAtIso?: string;
  className?: string;
  light?: boolean;
  /** Hide views on screens below `sm` (Latest Stories list on mobile). */
  hideViewsBelowSm?: boolean;
};

export function ArticleMeta({
  author,
  readTime,
  views,
  commentCount,
  commentHref,
  publishedAt,
  publishedAtIso,
  updatedAtIso,
  className,
  light = false,
  hideViewsBelowSm = false,
}: ArticleMetaProps) {
  const commentContent = (
    <>
      <MessageSquare className="size-4 shrink-0" aria-hidden />
      {formatCount(commentCount ?? 0)}
    </>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 flex-wrap",
        light
          ? "font-sans text-[12px] leading-4 text-white/80 sm:text-[13px]"
          : "font-sans text-[12px] leading-4 text-muted-foreground",
        className,
      )}
    >
      <span>{author}</span>
      {publishedAtIso || updatedAtIso || publishedAt ? (
        <>
          <span aria-hidden> · </span>
          <ArticleTimestamps
            variant="compact"
            publishedAtIso={publishedAtIso}
            updatedAtIso={updatedAtIso}
            fallback={publishedAt}
            light={light}
          />
        </>
      ) : null}
      <span aria-hidden> · </span>
      <span>{readTime}</span>
      {views != null ? (
        <>
          <span aria-hidden className={cn(hideViewsBelowSm && "hidden sm:inline")}>
            {" "}
            ·{" "}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              hideViewsBelowSm && "hidden sm:inline-flex",
            )}
          >
            <EyeIcon className="size-4 shrink-0" aria-hidden />
            {formatCount(views)}
          </span>
        </>
      ) : null}
      {commentCount != null || commentHref ? (
        <>
          <span aria-hidden> · </span>
          {commentHref ? (
            <Link
              to={commentHref}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "inline-flex items-center gap-1 hover:text-primary",
                light && "hover:text-white",
              )}
              aria-label={`${formatCount(commentCount ?? 0)} comments`}
            >
              {commentContent}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">{commentContent}</span>
          )}
        </>
      ) : null}
    </div>
  );
}
