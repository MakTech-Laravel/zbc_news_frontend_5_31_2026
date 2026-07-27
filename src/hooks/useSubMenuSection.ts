import { useEffect, useState } from "react";

import {
  fetchSubMenuSection,
  type SubMenuKey,
  type SubMenuPayload,
} from "@/services/frontend/subMenu";

export function useSubMenuSection(section: SubMenuKey) {
  const [data, setData] = useState<SubMenuPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchSubMenuSection(section)
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Failed to load sub menu");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [section]);

  return {
    data,
    settings: data?.settings ?? null,
    items: data?.items ?? [],
    loading,
    error,
    enabled: data?.settings.is_enabled ?? true,
  };
}
