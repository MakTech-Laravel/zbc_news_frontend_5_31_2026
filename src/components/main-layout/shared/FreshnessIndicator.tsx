import { useRelativeTime } from "@/hooks/useRelativeTime";
import { cn } from "@/lib/utils";

type FreshnessIndicatorProps = {
  dateTime: string;
  className?: string;
  fallback?: string;
};

export function FreshnessIndicator({
  dateTime,
  className,
  fallback,
}: FreshnessIndicatorProps) {
  const label = useRelativeTime(dateTime);

  if (!label) {
    return fallback ? <span className={className}>{fallback}</span> : null;
  }

  return (
    <time dateTime={dateTime} className={cn(className)}>
      {label}
    </time>
  );
}
