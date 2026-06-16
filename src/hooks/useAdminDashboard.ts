import { useEffect, useState } from "react";
import {
  fetchAdminDashboardOverview,
  type AdminDashboardOverview,
} from "@/services/admin/dashboard";

type State = {
  data: AdminDashboardOverview | null;
  loading: boolean;
  error: string | null;
};

export function useAdminDashboard() {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchAdminDashboardOverview()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: err?.message ?? "Failed to load dashboard" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
