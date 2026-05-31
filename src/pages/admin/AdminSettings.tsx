import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { IntegrationsSettingsTab } from "@/components/admin/settings/IntegrationsSettingsTab";
import { ReadingSettingsTab } from "@/components/admin/settings/ReadingSettingsTab";
import { SeoSettingsTab } from "@/components/admin/settings/SeoSettingsTab";
import { SettingsPageShell } from "@/components/admin/settings/SettingsPageShell";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { WritingSettingsTab } from "@/components/admin/settings/WritingSettingsTab";
import { useAdminSettings } from "@/components/admin/settings/useAdminSettings";
import type { SettingsTabId } from "@/components/admin/settings/types";

const TAB_IDS: SettingsTabId[] = [
  "general",
  "seo",
  "writing",
  "reading",
  "integrations",
];

function isSettingsTab(value: string | null): value is SettingsTabId {
  return value !== null && TAB_IDS.includes(value as SettingsTabId);
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const settings = useAdminSettings();
  const tabParam = searchParams.get("tab");

  const { setActiveTab } = settings;

  useEffect(() => {
    if (isSettingsTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, setActiveTab]);

  const handleTabChange = (tab: SettingsTabId) => {
    settings.setActiveTab(tab);
    navigate(tab === "general" ? "/admin/settings" : `/admin/settings?tab=${tab}`);
  };

  return (
    <SettingsPageShell activeTab={settings.activeTab} onTabChange={handleTabChange}>
      {settings.activeTab === "general" ? (
        <GeneralSettingsTab settings={settings} />
      ) : null}
      {settings.activeTab === "seo" ? <SeoSettingsTab /> : null}
      {settings.activeTab === "writing" ? (
        <WritingSettingsTab settings={settings} />
      ) : null}
      {settings.activeTab === "reading" ? (
        <ReadingSettingsTab settings={settings} />
      ) : null}
      {settings.activeTab === "integrations" ? (
        <IntegrationsSettingsTab settings={settings} />
      ) : null}

      <SettingsSaveBar onSave={settings.save} />
    </SettingsPageShell>
  );
}
