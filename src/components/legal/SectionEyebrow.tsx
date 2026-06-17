import { cn } from "@/lib/utils";

type SectionEyebrowProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "red" | "blue" | "light-blue";
};

export function SectionEyebrow({ children, className, variant = "red" }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-[0.14em]",
        variant === "red" && "text-zbc-red-accent",
        variant === "blue" && "text-zbc-blue-muted",
        variant === "light-blue" && "text-zbc-blue-light",
        className,
      )}
    >
      {children}
    </p>
  );
}
