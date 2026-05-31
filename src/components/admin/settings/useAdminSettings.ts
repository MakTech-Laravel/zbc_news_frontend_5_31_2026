import * as React from "react";

import {
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettingsForm,
  type SettingsTabId,
} from "@/components/admin/settings/types";

export function useAdminSettings() {
  const [activeTab, setActiveTab] = React.useState<SettingsTabId>("general");
  const [form, setForm] = React.useState<AdminSettingsForm>(DEFAULT_ADMIN_SETTINGS);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const setField = React.useCallback(
    <K extends keyof AdminSettingsForm>(key: K, value: AdminSettingsForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setLogoFile = React.useCallback((file: File | null) => {
    setLogoPreview((prev) => {
      if (prev?.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const save = React.useCallback(() => {
    /* persist settings */
  }, []);

  return {
    activeTab,
    setActiveTab,
    form,
    setField,
    logoPreview,
    setLogoFile,
    save,
  };
}

export type UseAdminSettingsReturn = ReturnType<typeof useAdminSettings>;
