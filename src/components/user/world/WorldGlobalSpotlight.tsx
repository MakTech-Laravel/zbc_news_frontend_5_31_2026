import { Link } from "react-router-dom";

import { worldGlobalSpotlight } from "@/data/dummy/worldNews";
import { cn } from "@/lib/utils";

type WorldGlobalSpotlightProps = {
  className?: string;
};

export function WorldGlobalSpotlight({ className }: WorldGlobalSpotlightProps) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[14px] border border-black/10 bg-white p-6",
        className,
      )}
    >
      <h2 className="font-inter text-base font-medium text-ink-heading">Global Spotlight</h2>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        {worldGlobalSpotlight.map((item) => (
          <Link
            key={item.id}
            to="/news-details"
            className="rounded-[10px] bg-[#ECECF0] px-3 py-3 transition-colors hover:bg-[#E4E4E8]"
          >
            <p className="font-inter text-sm font-medium leading-5 text-ink-heading">{item.title}</p>
            <p className="mt-1 font-inter text-xs leading-4 text-ink-muted">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
