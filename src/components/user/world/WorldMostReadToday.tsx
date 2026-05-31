import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { worldMostReadToday } from "@/data/dummy/worldNews";
import { cn } from "@/lib/utils";

type WorldMostReadTodayProps = {
  className?: string;
};

export function WorldMostReadToday({ className }: WorldMostReadTodayProps) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[14px] border border-black/10 bg-white p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-inter text-base font-medium text-ink-heading">
        <TrendingUp className="size-4 shrink-0 text-brand-deep" aria-hidden />
        Most Read Today
      </h2>
      <ol className="mt-4 flex flex-1 flex-col gap-2">
        {worldMostReadToday.map((item) => (
          <li key={item.rank} className="flex gap-2">
            <span className="shrink-0 font-inter text-xs font-medium leading-5 text-ink-muted">
              {item.rank}.
            </span>
            <Link
              to="/news-details"
              className="font-inter text-sm font-medium leading-5 text-ink-heading transition-colors hover:text-brand-deep line-clamp-2"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
