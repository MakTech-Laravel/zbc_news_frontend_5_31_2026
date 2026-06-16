export const MONETIZATION_TABS = [
  { id: "overview", label: "Overview" },
  { id: "ads", label: "Ads" },
  { id: "quick-links", label: "Quick Links" },
  { id: "payments", label: "Payments" },
] as const;

export type MonetizationTabId = (typeof MONETIZATION_TABS)[number]["id"];
