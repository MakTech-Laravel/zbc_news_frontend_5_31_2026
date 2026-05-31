import { AdUnit } from "@/components/main-layout/shared/AdUnit";

import { NewsletterSignup } from "./NewsletterSignup";
import { SidebarNav } from "./SidebarNav";
import { WeatherWidget } from "./WeatherWidget";

export function LeftSidebar() {
  return (
    <aside className="space-y-5" aria-label="Left sidebar">
      <WeatherWidget />
      <AdUnit variant="sidebar" />
      <NewsletterSignup />
      <SidebarNav />
    </aside>
  );
}
