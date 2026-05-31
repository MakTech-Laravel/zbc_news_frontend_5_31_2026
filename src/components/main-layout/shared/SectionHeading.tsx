import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  title: string;
  className?: string;
  bordered?: boolean;
};

export function SectionHeading({
  id,
  title,
  className,
  bordered = false,
}: SectionHeadingProps) {
  const heading = (
    <h2
      id={id}
      className={cn(
        "font-heading text-[18px] font-bold leading-6 tracking-tight text-foreground sm:text-[20px] sm:leading-7",
        className,
      )}
    >
      {title}
    </h2>
  );

  if (bordered) {
    return (
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3 sm:mb-5">
        {heading}
      </div>
    );
  }

  return heading;
}
