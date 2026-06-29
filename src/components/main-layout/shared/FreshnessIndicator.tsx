import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getArticleRelativeTimeIso } from "@/lib/articleTimestamps";
import { cn } from "@/lib/utils";

type FreshnessIndicatorProps = {
  dateTime?: string;
  publishedAtIso?: string;
  updatedAtIso?: string;
  className?: string;
  fallback?: string;
};

export function FreshnessIndicator({
  dateTime,
  publishedAtIso,
  updatedAtIso,
  className,
  fallback,
}: FreshnessIndicatorProps) {
  const iso =
    dateTime ?? getArticleRelativeTimeIso(publishedAtIso, updatedAtIso);
  const label = useRelativeTime(iso);

  if (!label) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }

  return (
    <time dateTime={iso} className={cn(className)}>
      {label}
    </time>
  );
}
