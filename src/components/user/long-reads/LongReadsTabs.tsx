import { cn } from "@/lib/utils";
import type { LongReadTab } from "@/types/longReads";

const TABS: { id: LongReadTab; label: string }[] = [
  { id: "all", label: "All Long Reads" },
  { id: "most-read", label: "Most Read" },
];

type LongReadsTabsProps = {
  activeTab: LongReadTab;
  onTabChange: (tab: LongReadTab) => void;
};

export function LongReadsTabs({ activeTab, onTabChange }: LongReadsTabsProps) {
  return (
    <div
      className="inline-flex w-full max-w-full flex-wrap gap-0 rounded-[14px] bg-[#ECECF0] p-[3px] sm:w-auto"
      role="tablist"
      aria-label="Long reads filters"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-[14px] px-3 py-1.5 font-inter text-sm font-medium leading-5 transition-colors",
              isActive
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
