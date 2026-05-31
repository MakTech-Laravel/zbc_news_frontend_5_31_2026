import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminFormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminFormField({ label, htmlFor, hint, children, className }: AdminFormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#364153]">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-admin-trend-muted">{hint}</p> : null}
    </div>
  );
}
