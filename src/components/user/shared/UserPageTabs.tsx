import { cn } from "@/lib/utils";

export type UserTab = {
  id: string;
  label: string;
  badge?: string | number;
};

type UserPageTabsProps = {
  tabs: UserTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function UserPageTabs({ tabs, activeId, onChange, className }: UserPageTabsProps) {
  return (
    <div className={cn("-mx-1 max-w-full overflow-x-auto px-1 pb-0.5", className)}>
      <div
        className="inline-flex w-max min-w-0 flex-nowrap rounded-xl border border-border bg-muted p-1"
        role="tablist"
      >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-card text-admin-heading shadow-sm"
                : "text-admin-label hover:text-admin-heading",
            )}
          >
            {tab.label}
            {tab.badge !== undefined ? (
              <span
                className={cn(
                  "inline-flex min-h-5 min-w-5 items-center justify-center rounded-lg px-1.5 text-xs font-medium",
                  active
                    ? "bg-zbc-red text-white"
                    : "bg-transparent text-admin-label",
                )}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
      </div>
    </div>
  );
}
