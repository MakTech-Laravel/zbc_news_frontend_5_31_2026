import { editorsNote } from "@/data/dummy/longReads";
import { cn } from "@/lib/utils";

type LongReadsEditorsNoteProps = {
  className?: string;
};

export function LongReadsEditorsNote({ className }: LongReadsEditorsNoteProps) {
  return (
    <section
      className={cn(
        "rounded-[14px] border border-user-long-read/20 bg-user-long-read/5 p-6",
        className,
      )}
    >
      <h2 className="font-inter text-base font-medium text-ink-heading">Editor&apos;s Note</h2>
      <p className="mt-3 font-inter text-sm leading-5 text-ink-muted">{editorsNote}</p>
    </section>
  );
}
