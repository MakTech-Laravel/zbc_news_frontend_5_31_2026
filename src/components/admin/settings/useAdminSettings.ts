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

export function useAdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<SettingsTabId>("general");
  const [form, setForm] = React.useState<AdminSettingsForm>(DEFAULT_ADMIN_SETTINGS);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [logoFile, setLogoFileState] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const setField = React.useCallback(
    <K extends keyof AdminSettingsForm>(key: K, value: AdminSettingsForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setLogoFile = React.useCallback((file: File | null) => {
    setLogoFileState(file);
    setLogoPreview((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    fetchAdminSiteSettings()
      .then(({ settings, logoUrl }) => {
        if (cancelled) return;
        setForm(settings);
        if (logoUrl) setLogoPreview(logoUrl);
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

  React.useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const save = React.useCallback(async () => {
    setSaving(true);
    try {
      const raw = await updateAdminSiteSettings(form, logoFile);
      const nextForm = mapSiteSettingsToForm(raw);
      setForm(nextForm);
      if (raw.site_logo) setLogoPreview(raw.site_logo);
      setLogoFileState(null);
      await queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [form, logoFile, queryClient]);

  return {
    activeTab,
    setActiveTab,
    form,
    setField,
    logoPreview,
    setLogoFile,
    save,
    loading,
    saving,
  };
}

export type UseAdminSettingsReturn = ReturnType<typeof useAdminSettings>;
