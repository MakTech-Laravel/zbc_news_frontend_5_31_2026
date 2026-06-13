import type { LongReadCollection } from "@/types/longReads";
import { cn } from "@/lib/utils";

import { LongReadsCollections } from "@/components/user/long-reads/LongReadsCollections";
import { LongReadsEditorsNote } from "@/components/user/long-reads/LongReadsEditorsNote";
import { LongReadsLengthFilter } from "@/components/user/long-reads/LongReadsLengthFilter";

type LongReadsSidebarProps = {
  className?: string;
  collections?: LongReadCollection[];
  loading?: boolean;
};

export function LongReadsSidebar({
  className,
  collections,
  loading = false,
}: LongReadsSidebarProps) {
  return (
    <aside className={cn("flex flex-col gap-6", className)} aria-label="Long reads filters">
      <LongReadsCollections collections={collections} loading={loading} />
      <LongReadsLengthFilter />
      <LongReadsEditorsNote />
    </aside>
  );
}
