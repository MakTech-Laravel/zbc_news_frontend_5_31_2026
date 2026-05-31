import { MapPin } from "lucide-react";

import { worldTopStoriesByRegion } from "@/data/dummy/worldNews";
import { cn } from "@/lib/utils";

type WorldTopStoriesByRegionProps = {
  className?: string;
  onRegionSelect?: (regionId: string) => void;
};

export function WorldTopStoriesByRegion({ className, onRegionSelect }: WorldTopStoriesByRegionProps) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-[14px] border border-black/10 bg-white p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-inter text-base font-medium text-ink-heading">
        <MapPin className="size-4 shrink-0 text-brand-deep" aria-hidden />
        Top Stories by Region
      </h2>
      <ul className="mt-4 flex flex-1 flex-col gap-1">
        {worldTopStoriesByRegion.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onRegionSelect?.(item.id)}
              className="flex w-full items-center justify-between rounded-[10px] p-2 text-left transition-colors hover:bg-muted/60"
            >
              <span className="font-inter text-sm font-medium text-ink-heading">{item.label}</span>
              <span className="rounded-lg bg-[#ECEEF2] px-2 py-0.5 font-inter text-xs font-medium text-[#030213]">
                {item.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
