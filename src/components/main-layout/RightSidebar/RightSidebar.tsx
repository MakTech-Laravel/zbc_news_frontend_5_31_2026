import { AdUnit } from "@/components/main-layout/shared/AdUnit";

import { MostReadCard } from "./MostReadCard";
import { TrendingNowCard } from "./TrendingNowCard";

export function RightSidebar() {
  return (
    <aside className="space-y-5" aria-label="Right sidebar">
      <MostReadCard />
      <AdUnit variant="square" slotKey="right_sidebar_primary" />
      <TrendingNowCard />
    </aside>
  );
}
