import { LongReadsCollections } from "@/components/user/long-reads/LongReadsCollections";
import { LongReadsLengthFilter } from "@/components/user/long-reads/LongReadsLengthFilter";
import { LongReadsEditorsNote } from "@/components/user/long-reads/LongReadsEditorsNote";
import { cn } from "@/lib/utils";

type LongReadsSidebarProps = {
  className?: string;
};

export function LongReadsSidebar({ className }: LongReadsSidebarProps) {
  return (
    <aside className={cn("flex flex-col gap-6", className)} aria-label="Long reads filters">
      <LongReadsCollections />
      <LongReadsLengthFilter />
      <LongReadsEditorsNote />
    </aside>
  );
}
