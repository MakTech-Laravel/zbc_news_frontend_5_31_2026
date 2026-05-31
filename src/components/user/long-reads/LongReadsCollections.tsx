import { Bookmark} from "lucide-react";

import { longReadCollections } from "@/data/dummy/longReads";
import { cn } from "@/lib/utils";

type LongReadsCollectionsProps = {
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function LongReadsCollections({ activeId, onSelect, className }: LongReadsCollectionsProps) {
  return (
    <section
      className={cn(
        "rounded-[14px] border border-black/10 bg-white p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-inter text-base font-medium text-ink-heading">
        <Bookmark className="size-4" aria-hidden />
        Collections
      </h2>
      <ul className="mt-4 space-y-1">
        {longReadCollections.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-[10px] p-2 text-left transition-colors",
                activeId === item.id
                  ? "bg-user-long-read/10"
                  : "hover:bg-muted/60",
              )}
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
