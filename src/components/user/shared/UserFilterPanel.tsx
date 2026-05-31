import * as React from "react";
import { ChevronDown, Filter, FolderOpen } from "lucide-react";
import type { ReactNode } from "react";

import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import type { UserCategoryFilter } from "@/data/dummy/userPages";
import { cn } from "@/lib/utils";

type UserFilterPanelProps = {
  categories: UserCategoryFilter[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  quickFilters: readonly string[];
  activeQuickFilter?: string;
  onQuickFilterChange?: (filter: string) => void;
};

type FilterCollapsibleCardProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

function FilterCollapsibleCard({
  title,
  icon,
  children,
  defaultOpen = false,
}: FilterCollapsibleCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <UserDashboardCard>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left xl:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-admin-heading">
          <span className="text-admin-label">{icon}</span>
          <span className="text-base font-semibold leading-6">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-admin-label transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <UserDashboardCardHeader
        title={title}
        icon={icon}
        className="hidden px-4 py-4 xl:flex"
      />

      <div className={cn(open ? "block" : "hidden", "xl:block")}>{children}</div>
    </UserDashboardCard>
  );
}

export function UserFilterPanel({
  categories,
  activeCategoryId,
  onCategoryChange,
  quickFilters,
  activeQuickFilter,
  onQuickFilterChange,
}: UserFilterPanelProps) {
  return (
    <div className="space-y-4">
      <FilterCollapsibleCard title="Categories" icon={<FolderOpen className="size-4" />}>
        <ul className="space-y-1 border-t border-border p-4 xl:border-t-0">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors",
                  activeCategoryId === cat.id
                    ? "bg-brand-soft font-medium text-brand-deep"
                    : "text-admin-heading hover:bg-muted",
                )}
              >
                <span>{cat.label}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs text-admin-label">
                  {cat.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </FilterCollapsibleCard>

      <FilterCollapsibleCard title="Quick Filters" icon={<Filter className="size-4" />}>
        <div className="flex flex-col gap-2 border-t border-border p-4 xl:border-t-0">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onQuickFilterChange?.(filter)}
              className={cn(
                "h-8 rounded-lg border px-3 text-left text-sm font-medium transition-colors",
                activeQuickFilter === filter
                  ? "border-zbc-blue bg-brand-soft text-brand-deep"
                  : "border-border bg-card text-admin-heading hover:bg-muted",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </FilterCollapsibleCard>
    </div>
  );
}
