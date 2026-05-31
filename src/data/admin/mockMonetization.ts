export type AdPlacement = {
  id: string;
  name: string;
  location: string;
  impressions: string;
  ctr: string;
  revenue: string;
  enabled: boolean;
};

export const MOCK_AD_PLACEMENTS: AdPlacement[] = [
  {
    id: "homepage-banner",
    name: "Homepage Banner",
    location: "Top of page",
    impressions: "125,000",
    ctr: "5.2%",
    revenue: "$2,500",
    enabled: true,
  },
  {
    id: "sidebar-widget",
    name: "Sidebar Widget",
    location: "Right sidebar",
    impressions: "98,000",
    ctr: "3.8%",
    revenue: "$1,960",
    enabled: true,
  },
  {
    id: "article-inline",
    name: "Article Inline",
    location: "Mid-article",
    impressions: "156,000",
    ctr: "6.4%",
    revenue: "$3,120",
    enabled: true,
  },
  {
    id: "footer-banner",
    name: "Footer Banner",
    location: "Bottom of page",
    impressions: "45,000",
    ctr: "2.1%",
    revenue: "$900",
    enabled: true,
  },
];
