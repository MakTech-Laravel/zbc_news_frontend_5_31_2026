import { CreditCard } from "lucide-react";

import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { Button } from "@/components/ui/button";

export function UserPaymentMethodSection() {
  return (
    <UserDashboardCard>
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-admin-label" strokeWidth={1.5} aria-hidden />
          <h2 className="text-base font-semibold leading-5 text-admin-heading">
            Payment Method
          </h2>
        </div>
        <p className="mt-1 text-base leading-6 text-admin-label">
          Manage your payment information
        </p>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-8 w-12 items-center justify-center rounded-md border border-border bg-card">
              <CreditCard className="size-5 text-admin-label" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-base leading-6 text-admin-heading">•••• •••• •••• 4242</p>
              <p className="text-sm text-admin-label">Expires 12/2027</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg">
              Update
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg">
              Remove
            </Button>
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 rounded-lg">
          Add Payment Method
        </Button>
      </div>
    </UserDashboardCard>
  );
}
