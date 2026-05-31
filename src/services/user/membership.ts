import type { MembershipPlan, UserMembershipSummary } from "@/types/user";
import { membershipPlans as dummyPlans } from "@/data/dummy/userPages";

/** Replace with API call when backend is ready. */
export async function fetchMembershipPlans(): Promise<MembershipPlan[]> {
  return dummyPlans.map((p) => ({ ...p }));
}

export async function fetchMembershipSummary(): Promise<UserMembershipSummary> {
  return {
    planName: "Premium Membership",
    status: "active",
    nextBillingDate: "June 1, 2026",
    priceLabel: "$9.99/month",
  };
}

/** Placeholder — wire to billing API. */
export async function requestMembershipCancellation(): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}
