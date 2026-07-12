import * as React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettingsForm,
  type SettingsTabId,
} from "@/components/admin/settings/types";
import {
  fetchAdminSiteSettings,
  updateAdminSiteSettings,
} from "@/services/admin/siteSettings";
import { mapSiteSettingsToForm } from "@/types/siteSettings";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export function useAdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<SettingsTabId>("general");
  const [form, setForm] = React.useState<AdminSettingsForm>(DEFAULT_ADMIN_SETTINGS);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const setField = React.useCallback(
    <K extends keyof AdminSettingsForm>(key: K, value: AdminSettingsForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  React.useEffect(() => {
    let cancelled = false;

    fetchAdminSiteSettings()
      .then(({ settings, logoUrl: loadedLogoUrl, faviconUrl: loadedFaviconUrl }) => {
        if (cancelled) return;
        setForm(settings);
        if (loadedLogoUrl) setLogoUrl(resolveMediaUrl(loadedLogoUrl));
        if (loadedFaviconUrl) setFaviconUrl(resolveMediaUrl(loadedFaviconUrl));
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load site settings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = React.useCallback(async () => {
    setSaving(true);
    try {
      const raw = await updateAdminSiteSettings(form, logoUrl, faviconUrl);
      const nextForm = mapSiteSettingsToForm(raw);
      setForm(nextForm);
      setLogoUrl(raw.site_logo ? resolveMediaUrl(raw.site_logo) : null);
      setFaviconUrl(raw.favicon ? resolveMediaUrl(raw.favicon) : null);
      await queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [form, logoUrl, faviconUrl, queryClient]);

  return {
    activeTab,
    setActiveTab,
    form,
    setField,
    logoUrl,
    setLogoUrl,
    faviconUrl,
    setFaviconUrl,
    save,
    loading,
    saving,
  };
}

export type UseAdminSettingsReturn = ReturnType<typeof useAdminSettings>;
