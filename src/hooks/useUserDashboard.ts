import { useEffect, useState } from "react";
import { fetchUserDashboard, type UserDashboardData } from "@/services/user/dashboard";

type State = {
  data: UserDashboardData | null;
  loading: boolean;
  error: string | null;
};

export function useUserDashboard() {
  const [state, setState] = useState<State>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchUserDashboard()
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
