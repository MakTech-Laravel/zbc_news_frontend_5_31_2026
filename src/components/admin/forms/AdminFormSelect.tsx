import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type AdminFormSelectOption = {
  value: string;
  label: string;
};

type AdminFormSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly AdminFormSelectOption[];
  className?: string;
};

export function AdminFormSelect({
  id,
  value,
  onChange,
  options,
  className,
}: AdminFormSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-[10px] border border-admin-input-border bg-white px-3 pr-9 text-sm text-admin-heading outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue/30",
          className,
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-admin-label"
        aria-hidden
      />
    </div>
  );
}
