import { DollarSign, Eye, MousePointerClick, ScrollText } from "lucide-react";

import { AdminMetricCard } from "@/components/admin/dashboard/AdminMetricCard";
import { AdPlacementManager } from "@/components/admin/monetization/AdPlacementManager";
import { MonthlyEarningsChart } from "@/components/admin/monetization/MonthlyEarningsChart";
import { PaymentSettingsSection } from "@/components/admin/monetization/PaymentSettingsSection";
import { WeeklyAdPerformanceChart } from "@/components/admin/monetization/WeeklyAdPerformanceChart";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";

const METRICS = [
  {
    label: "Today's Revenue",
    value: "$1,450",
    trend: "+12.5%",
    iconTone: "green" as const,
    Icon: DollarSign,
  },
  {
    label: "This Week",
    value: "$8,920",
    trend: "+8.2%",
    iconTone: "blue" as const,
    Icon: DollarSign,
  },
  {
    label: "Total Impressions",
    value: "388K",
    trend: "+15.3%",
    iconTone: "purple" as const,
    Icon: Eye,
  },
  {
    label: "Average CTR",
    value: "4.8%",
    trend: "+2.1%",
    iconTone: "orange" as const,
    Icon: MousePointerClick,
  },
];

export default function AdminMonetization() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Monetization"
        description="Track revenue, manage ads, and payment settings"
        actionLabel="View Transactions"
        actionIcon={<ScrollText className="size-5" aria-hidden />}
        onAction={() => {
          /* open transactions */
        }}
      />

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            {...metric}
            trendDirection="up"
            trendSuffix={null}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MonthlyEarningsChart />
        <WeeklyAdPerformanceChart />
      </section>

      <AdPlacementManager />

      <PaymentSettingsSection />
    </div>
  );
}
