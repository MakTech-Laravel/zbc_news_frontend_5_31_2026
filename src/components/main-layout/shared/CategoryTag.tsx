import { cn } from "@/lib/utils";

type CategoryTagProps = {
  label: string;
  className?: string;
};

export function CategoryTag({ label, className }: CategoryTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs bg-primary px-3 py-2 font-inter text-xs font-bold uppercase leading-none tracking-[0.08em] text-primary-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
