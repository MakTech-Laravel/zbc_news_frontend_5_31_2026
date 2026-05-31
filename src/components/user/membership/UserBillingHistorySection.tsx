import { Download } from "lucide-react";

import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import { billingHistory } from "@/data/dummy/userPages";
import { Button } from "@/components/ui/button";

export function UserBillingHistorySection() {
  return (
    <UserDashboardCard>
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-base font-semibold leading-5 text-admin-heading">
          Billing History
        </h2>
        <p className="mt-1 text-base leading-6 text-admin-label">
          View and download past invoices
        </p>
      </div>

      <div className="space-y-2 px-6 py-6">
        {billingHistory.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-admin-heading">{row.date}</p>
              <p className="text-xs text-admin-label">{row.invoice}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-admin-heading">{row.amount}</span>
              <UserStatusBadge label={row.status} variant="paid" />
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-lg [&_svg]:size-4"
                aria-label={`Download invoice ${row.invoice}`}
              >
                <Download className="size-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </UserDashboardCard>
  );
}
