import { cn } from "@/lib/utils";
import type { WorldRegionId } from "@/data/dummy/worldNews";

type WorldRegionTabsProps = {
  tabs: { id: WorldRegionId; label: string }[];
  activeId: WorldRegionId;
  onChange: (id: WorldRegionId) => void;
};

export function WorldRegionTabs({ tabs, activeId, onChange }: WorldRegionTabsProps) {
  return (
    // WorldRegionTabs.tsx

    <div
      className="flex w-full flex-wrap gap-0 rounded-[14px] bg-[#ECECF0] p-[3px]"
      role="tablist"
      aria-label="Filter by region"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 rounded-[14px] px-3 py-1.5 text-center font-inter text-sm font-medium leading-5 transition-colors",
              active
                ? "bg-white text-ink-heading shadow-sm"
                : "text-ink-heading hover:bg-white/60",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
