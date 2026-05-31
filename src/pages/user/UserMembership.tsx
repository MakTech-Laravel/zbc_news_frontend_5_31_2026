import { UserPageShell } from "@/components/user/UserPageShell";
import { UserBillingHistorySection } from "@/components/user/membership/UserBillingHistorySection";
import { UserMembershipBanner } from "@/components/user/membership/UserMembershipBanner";
import { UserMembershipPlanCard } from "@/components/user/membership/UserMembershipPlanCard";
import { UserPaymentMethodSection } from "@/components/user/membership/UserPaymentMethodSection";
import { useUserMembership } from "@/hooks/useUserMembership";

export default function UserMembership() {
  const { plans, summary, loading, cancelling, cancelMembership } = useUserMembership();

  if (loading || !summary) {
    return (
      <UserPageShell
        title="Membership & Billing"
        description="Manage your subscription and billing information"
      >
        <p className="text-sm text-admin-label">Loading membership…</p>
      </UserPageShell>
    );
  }

  return (
    <UserPageShell
      title="Membership & Billing"
      description="Manage your subscription and billing information"
    >
      <UserMembershipBanner
        summary={summary}
        onCancel={cancelMembership}
        cancelling={cancelling}
      />

      <section id="available-plans" className="scroll-mt-6 space-y-4">
        <h2 className="text-xl font-semibold leading-7 text-admin-heading">Available Plans</h2>
        <div className="grid grid-cols-1 gap-4 pt-2 sm:gap-6 sm:pt-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <UserMembershipPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <UserPaymentMethodSection />
      <UserBillingHistorySection />
    </UserPageShell>
  );
}
