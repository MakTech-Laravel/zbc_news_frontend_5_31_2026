import type { ReactNode } from "react";

import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import type { SettingsTabId } from "@/components/admin/settings/types";

type SettingsPageShellProps = {
  activeTab: SettingsTabId;
  onTabChange?: (tab: SettingsTabId) => void;
  children: ReactNode;
  showTabs?: boolean;
};

export function SettingsPageShell({
  activeTab,
  onTabChange,
  children,
  showTabs = true,
}: SettingsPageShellProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-admin-heading sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-admin-label sm:text-base">
          Configure your site settings and preferences
        </p>
      </div>

      {showTabs && onTabChange ? (
        <SettingsTabs activeTab={activeTab} onTabChange={onTabChange} />
      ) : null}

      {children}
    </div>
  );
}
