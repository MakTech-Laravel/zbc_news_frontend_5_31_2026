import { useState } from "react";
import { ScrollText } from "lucide-react";

import { AdSlotManagerDynamic } from "@/components/admin/monetization/AdSlotManagerDynamic";
import { HomeQuickLinksManager } from "@/components/admin/monetization/HomeQuickLinksManager";
import { MonetizationOverview } from "@/components/admin/monetization/MonetizationOverview";
import { MonetizationTabs } from "@/components/admin/monetization/MonetizationTabs";
import { PaymentSettingsSection } from "@/components/admin/monetization/PaymentSettingsSection";
import type { MonetizationTabId } from "@/components/admin/monetization/types";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";

export default function AdminMonetization() {
  const [activeTab, setActiveTab] = useState<MonetizationTabId>("overview");

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

      <MonetizationTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" ? <MonetizationOverview /> : null}

      {activeTab === "ads" ? <AdSlotManagerDynamic /> : null}

      {activeTab === "quick-links" ? <HomeQuickLinksManager /> : null}

      {activeTab === "payments" ? <PaymentSettingsSection /> : null}
    </div>
  );
}
