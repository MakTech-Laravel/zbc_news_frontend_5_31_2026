import { cn } from "@/lib/utils";

type LiveCoverageBadgeProps = {
  isLiveBlog?: boolean;
  isLive?: boolean;
  liveEndedAtIso?: string;
  className?: string;
  size?: "sm" | "md";
  /** Hide the grey "Live ended" badge on feed cards (detail pages still show it). */
  hideWhenEnded?: boolean;
};

export function LiveCoverageBadge({
  isLiveBlog,
  isLive,
  liveEndedAtIso,
  className,
  size = "sm",
  hideWhenEnded = false,
}: LiveCoverageBadgeProps) {
  if (!isLiveBlog) return null;

  if (isLive) {
    return (
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full bg-red-100 font-bold uppercase tracking-wide text-red-700",
          size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
          className,
        )}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-red-500" aria-hidden />
        Live
      </span>
    );
  }

  if (liveEndedAtIso) {
    if (hideWhenEnded) return null;

    return (
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full bg-zbc-gray-200 font-bold uppercase tracking-wide text-zbc-gray-700",
          size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-zbc-gray-500" aria-hidden />
        Live ended
      </span>
    );
  }

  return null;
}
