import { Calendar, Clock } from "lucide-react";

import { useRelativeTime } from "@/hooks/useRelativeTime";
import {
  articleWasUpdated,
  formatArticleTimestamp,
  getArticleRelativeTimeIso,
} from "@/lib/articleTimestamps";
import { cn } from "@/lib/utils";

type ArticleTimestampsProps = {
  publishedAtIso?: string | null;
  updatedAtIso?: string | null;
  className?: string;
  /** Full Published/Updated rows for article detail headers. */
  variant?: "detail" | "compact";
  light?: boolean;
  fallback?: string;
};

function RelativeTimeSuffix({ iso }: { iso?: string }) {
  const label = useRelativeTime(iso);
  if (!label) return null;
  return <> ({label})</>;
}

export function ArticleTimestamps({
  publishedAtIso,
  updatedAtIso,
  className,
  variant = "detail",
  light = false,
  fallback,
}: ArticleTimestampsProps) {
  const wasUpdated = articleWasUpdated(publishedAtIso, updatedAtIso);
  const published = formatArticleTimestamp(publishedAtIso);
  const updated = formatArticleTimestamp(updatedAtIso);
  const relativeIso = getArticleRelativeTimeIso(publishedAtIso, updatedAtIso);
  const compactLabel = useRelativeTime(relativeIso);

  if (variant === "compact") {
    if (!compactLabel) {
      return fallback ? <span className={className}>{fallback}</span> : null;
    }

    return (
      <time dateTime={relativeIso} className={className}>
        {compactLabel}
      </time>
    );
  }

  if (!published.label) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 font-inter text-sm",
        light ? "text-white/80" : "text-zbc-gray-500",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Calendar
          className={cn(
            "size-4 shrink-0",
            light ? "text-white/60" : "text-zbc-gray-400",
          )}
          aria-hidden
        />
        <span>
          Published:{" "}
          <time dateTime={published.iso}>{published.label}</time>
          {!wasUpdated ? <RelativeTimeSuffix iso={relativeIso} /> : null}
        </span>
      </span>

      {wasUpdated && updated.label ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock
            className={cn(
              "size-4 shrink-0",
              light ? "text-white/60" : "text-zbc-gray-400",
            )}
            aria-hidden
          />
          <span>
            Updated:{" "}
            <time dateTime={updated.iso}>{updated.label}</time>
            <RelativeTimeSuffix iso={updatedAtIso ?? undefined} />
          </span>
        </span>
      ) : null}
    </div>
  );
}
