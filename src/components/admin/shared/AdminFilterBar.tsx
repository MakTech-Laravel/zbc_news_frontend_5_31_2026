import { ChevronDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminFilterOption = {
  value: string;
  label: string;
};

type AdminFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusOptions: AdminFilterOption[];
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: AdminFilterOption[];
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  className?: string;
};

function AdminFilterSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AdminFilterOption[];
  "aria-label": string;
}) {
  return (
    <div className="relative w-full sm:w-auto sm:min-w-[120px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-admin-input-border bg-card py-2 pl-4 pr-9",
          "text-base text-admin-trend-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-admin-trend-muted"
        aria-hidden
      />
    </div>
  );
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusValue,
  onStatusChange,
  statusOptions,
  categoryValue,
  onCategoryChange,
  categoryOptions,
  showCategoryFilter = true,
  showStatusFilter = true,
  className,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:flex-row lg:items-center",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-admin-label"
          aria-hidden
        />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-[42px] rounded-[10px] border-admin-input-border pl-10 text-base placeholder:text-foreground/50"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showStatusFilter ? (
          <AdminFilterSelect
            value={statusValue}
            onChange={onStatusChange}
            options={statusOptions}
            aria-label="Filter by status"
          />
        ) : null}
        {showCategoryFilter && categoryValue != null && onCategoryChange && categoryOptions ? (
          <AdminFilterSelect
            value={categoryValue}
            onChange={onCategoryChange}
            options={categoryOptions}
            aria-label="Filter by category"
          />
        ) : null}
      </div>
    </div>
  );
}
