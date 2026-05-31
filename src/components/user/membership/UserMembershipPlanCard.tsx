import { Check } from "lucide-react";

import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import type { MembershipPlan } from "@/types/user";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserMembershipPlanCardProps = {
  plan: MembershipPlan;
};

export function UserMembershipPlanCard({ plan }: UserMembershipPlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-lg border bg-card shadow-sm",
        plan.highlighted ? "border-zbc-gray-700 ring-1 ring-zbc-gray-800/20" : "border-border",
      )}
    >
      {plan.badge ? (
        <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-1/2">
          <UserStatusBadge label={plan.badge} variant="featured" />
        </div>
      ) : null}

      <div className={cn("px-6 pb-6", plan.badge ? "pt-8" : "pt-6")}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold uppercase tracking-wide text-admin-heading">
            {plan.name}
          </h3>
          {plan.current ? (
            <UserStatusBadge label="Current" variant="current" />
          ) : null}
        </div>
        <p className="mt-2 text-base leading-6 text-admin-label">{plan.tagline}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-[30px] font-bold leading-9 tracking-tight text-admin-heading">
            {plan.price}
          </span>
          <span className="pb-1 text-sm text-admin-label">{plan.priceSuffix}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-admin-heading">
              <Check
                className="mt-0.5 size-4 shrink-0 text-black"
                strokeWidth={2}
                aria-hidden
              />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant={plan.ctaVariant === "current" ? "outline" : "default"}
          className={cn(
            "mt-6 h-9 w-full rounded-lg",
            plan.ctaVariant === "current" ? "pointer-events-none bg-zbc-gray-200/50 text-zbc-gray-700" : "bg-zbc-gray-700 text-white hover:bg-zbc-gray-800/90",
          )}
          disabled={plan.ctaVariant === "current"}
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  );
}
