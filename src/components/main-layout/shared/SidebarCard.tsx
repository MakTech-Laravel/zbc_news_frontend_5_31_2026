import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SidebarCard({ title, children, className }: SidebarCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-[18px]",
        className,
      )}
    >
      {title ? (
        <h3 className="mb-3 font-inter text-sm font-bold uppercase text-[#101828]">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}
