import { longReadLengthFilters } from "@/data/dummy/longReads";
import { cn } from "@/lib/utils";

type LongReadsLengthFilterProps = {
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function LongReadsLengthFilter({ activeId, onSelect, className }: LongReadsLengthFilterProps) {
  return (
    <section
      className={cn(
        "rounded-[14px] border border-black/10 bg-white p-6",
        className,
      )}
    >
      <h2 className="font-inter text-base font-medium text-ink-heading">Filter by Length</h2>
      <ul className="mt-4 space-y-1">
        {longReadLengthFilters.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              className={cn(
                "w-full rounded-[10px] p-2 text-left font-inter text-sm font-medium transition-colors",
                activeId === item.id
                  ? "bg-user-long-read/10 text-ink-heading"
                  : "text-ink-heading hover:bg-muted/60",
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
