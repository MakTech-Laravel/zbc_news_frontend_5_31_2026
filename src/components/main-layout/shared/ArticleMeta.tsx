import { cn } from "@/lib/utils";
import { EyeIcon } from "lucide-react";

import { FreshnessIndicator } from "@/components/main-layout/shared/FreshnessIndicator";
import { getArticleFreshnessIso } from "@/lib/relativeTime";

type ArticleMetaProps = {
  author: string;
  readTime: string;
  views?: number;
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
  publishedAt,
  publishedAtIso,
  updatedAtIso,
  className,
  light = false,
  hideViewsBelowSm = false,
}: ArticleMetaProps) {
  const freshnessIso = getArticleFreshnessIso({ publishedAtIso, updatedAtIso });

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
      <span aria-hidden> · </span>
      <span>{readTime}</span>
      {freshnessIso ? (
        <>
          <span aria-hidden> · </span>
          <FreshnessIndicator dateTime={freshnessIso} fallback={publishedAt} />
        </>
      ) : publishedAt ? (
        <>
          <span aria-hidden> · </span>
          <span>{publishedAt}</span>
        </>
      ) : null}
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
            {views} K
          </span>
        </>
      ) : null}
    </div>
  );
}
