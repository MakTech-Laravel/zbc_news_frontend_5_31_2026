import * as React from "react";

import {
  fetchMembershipPlans,
  fetchMembershipSummary,
  requestMembershipCancellation,
} from "@/services/user/membership";
import type { MembershipPlan, UserMembershipSummary } from "@/types/user";

export function useUserMembership() {
  const [plans, setPlans] = React.useState<MembershipPlan[]>([]);
  const [summary, setSummary] = React.useState<UserMembershipSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMembershipPlans(), fetchMembershipSummary()]).then(([p, s]) => {
      if (!cancelled) {
        setPlans(p);
        setSummary(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cancelMembership = React.useCallback(async () => {
    setCancelling(true);
    try {
      await requestMembershipCancellation();
      return { ok: true as const };
    } finally {
      setCancelling(false);
    }
  }, []);

  return { plans, summary, loading, cancelling, cancelMembership };
}
