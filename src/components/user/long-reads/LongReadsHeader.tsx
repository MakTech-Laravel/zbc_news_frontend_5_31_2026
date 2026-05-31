import { Award, BookOpen, Clock } from "lucide-react";

import { longReadStats } from "@/data/dummy/longReads";

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center gap-3 sm:min-w-[180px]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-user-long-read/10">
        <Icon className="size-5 text-user-long-read" aria-hidden />
      </div>
      <div>
        <p className="font-inter text-2xl font-semibold leading-8 text-ink-heading">{value}</p>
        <p className="font-inter text-sm leading-5 text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

export function LongReadsHeader() {
  return (
    <header className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-user-long-read/10">
          <BookOpen className="size-6 text-user-long-read" aria-hidden />
        </div>
        <div>
          <h1 className="font-inter text-2xl font-semibold tracking-tight text-ink-heading sm:text-3xl">
            Long Reads
          </h1>
          <p className="font-inter text-base text-ink-muted">In-depth stories worth your time</p>
        </div>
      </div>

      <div className="rounded-[14px] border border-border-light bg-gradient-to-r from-user-long-read/10 via-user-long-read/5 to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <StatItem icon={BookOpen} value={String(longReadStats.articles)} label="Long-form Articles" />
          <StatItem icon={Clock} value={longReadStats.averageReadTime} label="Average Read Time" />
          <StatItem icon={Award} value={String(longReadStats.awardWinning)} label="Award-Winning Stories" />
        </div>
      </div>
    </header>
  );
}
