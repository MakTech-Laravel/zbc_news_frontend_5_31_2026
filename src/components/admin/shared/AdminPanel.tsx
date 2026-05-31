import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPanelProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "px-4 py-4 sm:px-[17px] sm:py-[17px]",
} as const;

export function AdminPanel({ children, className, padding = "md" }: AdminPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-card",
        PADDING[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
