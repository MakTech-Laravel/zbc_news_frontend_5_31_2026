import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MainContentProps = {
  children: ReactNode;
  className?: string;
};

export function MainContent({ children, className }: MainContentProps) {
  return <div className={cn("min-w-0 space-y-8", className)}>{children}</div>;
}
