import * as React from "react";
import { Calendar, CreditCard, Crown } from "lucide-react";

import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserMembershipSummary } from "@/types/user";
import { cn } from "@/lib/utils";

function scrollToPlans() {
  document.getElementById("available-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type UserMembershipBannerProps = {
  summary: UserMembershipSummary;
  onCancel: () => Promise<{ ok: true }>;
  cancelling?: boolean;
};

export function UserMembershipBanner({
  summary,
  onCancel,
  cancelling = false,
}: UserMembershipBannerProps) {
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);

  const handleConfirmCancel = async () => {
    await onCancel();
    setCancelOpen(false);
    setSuccessOpen(true);
  };

  return (
    <>
      <section className={cn("overflow-hidden rounded-2xl bg-user-banner-membership p-6 shadow-sm")}>
        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white/45 text-admin-heading">
              <Crown className="size-6" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold leading-7 text-admin-heading">
                  {summary.planName}
                </h2>
                <UserStatusBadge label="Active" variant="active" />
              </div>
              <p className="mt-1 text-base leading-6 text-admin-label">
                Enjoy unlimited access to all premium content
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-admin-label">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  Next billing: {summary.nextBillingDate}
                </span>
                <span className="hidden h-4 w-px bg-admin-heading/20 sm:block" aria-hidden />
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  {summary.priceLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-lg border-white/80 bg-white px-4 text-admin-heading shadow-sm hover:bg-white/90 sm:w-auto"
              onClick={scrollToPlans}
            >
              Change Plan
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-lg border-white/80 bg-white px-4 text-admin-heading shadow-sm hover:bg-white/90 sm:w-auto"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md gap-0 border-border bg-card p-0 sm:rounded-xl">
          <DialogHeader className="space-y-2 border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-lg font-semibold text-admin-heading">
              Cancel Premium membership?
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-admin-label">
              You will keep access until the end of your current billing period (
              {summary.nextBillingDate}). After that, your account will move to the Free plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 px-6 py-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-lg sm:w-auto"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Keep Membership
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-9 w-full rounded-lg sm:w-auto"
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling ? "Processing…" : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md gap-0 border-border bg-card p-0 sm:rounded-xl">
          <DialogHeader className="space-y-2 px-6 py-5 text-left">
            <DialogTitle className="text-lg font-semibold text-admin-heading">
              Cancellation requested
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-admin-label">
              Your cancellation request has been recorded. Premium access remains active until{" "}
              {summary.nextBillingDate}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 pb-5 sm:justify-end">
            <Button
              type="button"
              className="h-9 w-full rounded-lg sm:w-auto"
              onClick={() => setSuccessOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
