import { SETTINGS_TABS, type SettingsTabId } from "@/components/admin/settings/types";
import { cn } from "@/lib/utils";

type SettingsTabsProps = {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
};

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto border-b border-border pb-px">
      <nav
        className="flex min-w-max gap-4 px-1 sm:gap-8"
        aria-label="Settings sections"
      >
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "shrink-0 border-b-2 px-1 pb-3 pt-3 text-sm font-medium transition-colors sm:pb-[18px] sm:pt-4",
                isActive
                  ? "border-zbc-blue text-zbc-blue"
                  : "border-transparent text-admin-trend-muted hover:text-admin-heading",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
