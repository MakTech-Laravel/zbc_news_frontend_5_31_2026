import { cn } from "@/lib/utils";
import { EyeIcon } from "lucide-react";

type ArticleMetaProps = {
  author: string;
  readTime: string;
  views?: number;
  publishedAt?: string;
  className?: string;
  light?: boolean;
  /** Hide views on screens below `sm` (Latest Stories list on mobile). */
  hideViewsBelowSm?: boolean;
};

export function ArticleMeta({
  author,
  readTime,
  views,
  className,
  light = false,
  hideViewsBelowSm = false,
}: ArticleMetaProps) {
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
