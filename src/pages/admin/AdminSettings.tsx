import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { ContactSocialSettingsTab } from "@/components/admin/settings/ContactSocialSettingsTab";
import { GeneralSettingsTab } from "@/components/admin/settings/GeneralSettingsTab";
import { IntegrationsSettingsTab } from "@/components/admin/settings/IntegrationsSettingsTab";
import { NotificationsSettingsTab } from "@/components/admin/settings/NotificationsSettingsTab";
import { ReadingSettingsTab } from "@/components/admin/settings/ReadingSettingsTab";
import { SeoSettingsTab } from "@/components/admin/settings/SeoSettingsTab";
import { SettingsPageShell } from "@/components/admin/settings/SettingsPageShell";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { WritingSettingsTab } from "@/components/admin/settings/WritingSettingsTab";
import { useAdminSettings } from "@/components/admin/settings/useAdminSettings";
import type { SettingsTabId } from "@/components/admin/settings/types";
import { usePermission } from "@/hooks/usePermission";

const TAB_IDS: SettingsTabId[] = [
  "general",
  "contact_social",
  "seo",
  "writing",
  "reading",
  "integrations",
  "notifications",
];

function isSettingsTab(value: string | null): value is SettingsTabId {
  return value !== null && TAB_IDS.includes(value as SettingsTabId);
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const settings = useAdminSettings();
  const { hasAnyRole, isSuperAdmin } = usePermission();
  const canManageNotifications =
    isSuperAdmin || hasAnyRole(["admin", "super_admin"]);
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

  if (settings.loading) {
    return (
      <SettingsPageShell activeTab={settings.activeTab} onTabChange={handleTabChange}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
        </div>
      </SettingsPageShell>
    );
  }

  if (settings.activeTab === "notifications" && !canManageNotifications) {
    return <Navigate to="/admin/settings" replace />;
  }

  return (
    <SettingsPageShell activeTab={settings.activeTab} onTabChange={handleTabChange}>
      {settings.activeTab === "general" ? (
        <GeneralSettingsTab settings={settings} />
      ) : null}
      {settings.activeTab === "contact_social" ? (
        <ContactSocialSettingsTab settings={settings} />
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
      {settings.activeTab === "notifications" ? <NotificationsSettingsTab /> : null}

      {settings.activeTab !== "seo" && settings.activeTab !== "notifications" ? (
        <SettingsSaveBar
          onSave={settings.save}
          saving={settings.saving}
          disabled={settings.loading}
        />
      ) : null}
    </SettingsPageShell>
  );
}
