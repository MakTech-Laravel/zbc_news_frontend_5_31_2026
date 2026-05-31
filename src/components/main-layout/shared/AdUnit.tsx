import { cn } from "@/lib/utils";

type AdUnitProps = {
  variant?: "banner" | "square" | "sidebar";
  className?: string;
};

export function AdUnit({ variant = "banner", className }: AdUnitProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-xs border-3 border-dashed bg-muted font-inter text-xs font-semibold text-muted-foreground",
        variant === "banner" && "h-[120px] w-full",
        variant === "square" &&
          "aspect-[4/3] w-full max-h-[360px] lg:max-h-none lg:aspect-square",
        variant === "sidebar" && "h-[180px] w-full",
        className,
      )}
    >
     <div className="">
    <p className="font-inter text-xs font-semibold text-muted-foreground">Advertisement</p>
     <p className="font-inter text-xs font-normal text-muted-foreground">Sidebar Ad 1</p>
     </div>
    </div>
  );
}
