export const ADVERTISE_ASSETS = {
  analytics: "https://www.figma.com/api/mcp/asset/9353a076-fe79-4d47-b424-8635143454ee",
  bankingCaseStudy: "https://www.figma.com/api/mcp/asset/b3c26fe8-1d03-426c-8954-20063069f3b8",
  evCaseStudy: "https://www.figma.com/api/mcp/asset/acb116e2-2c3b-459f-a120-3c553a54c555",
} as const;

export type AdvertiseStat = {
  value: string;
  label: string;
};

export type AdvertisePlacement = {
  title: string;
  description: string;
  price: string;
  badge: string;
};

export type AdvertisePackage = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

export type AdvertiseCaseStudy = {
  title: string;
  rating: number;
  summary: string;
  image: string;
  imageAlt: string;
};

export const HERO_STATS: AdvertiseStat[] = [
  { value: "45M+", label: "Monthly Readers" },
  { value: "78%", label: "College-Educated" },
  { value: "34", label: "Median Age" },
  { value: "58%", label: "Decision-Makers" },
  { value: "50+", label: "Countries Reached" },
  { value: "8.2 min", label: "Avg Session Duration" },
];

export const WHY_STATS: AdvertiseStat[] = [
  { value: "4.8×", label: "Brand recall vs social ads" },
  { value: "2.3×", label: "Purchase intent uplift" },
  { value: "0%", label: "Bot / invalid traffic" },
  { value: "IAS", label: "Brand safety certified" },
];

export const PLACEMENTS: AdvertisePlacement[] = [
  {
    title: "Homepage Takeover",
    description:
      "Premium placement above-the-fold on our highest-traffic page. First impression for 1.2M daily visitors.",
    price: "From $8,500/day",
    badge: "3.8% avg CTR",
  },
  {
    title: "Newsletter Sponsorship",
    description:
      "Exclusive sponsorship of our flagship 'Morning Wire' digest sent to 2.1M subscribers daily.",
    price: "From $4,200/edition",
    badge: "44% open rate",
  },
  {
    title: "Article Mid-Roll",
    description:
      "Native-style placements within breaking news and long-form articles. High dwell time audience.",
    price: "From $12 CPM",
    badge: "2.6% avg CTR",
  },
  {
    title: "Video Pre-Roll",
    description:
      "15-second non-skippable pre-roll on our documentary and news video content.",
    price: "From $28 CPM",
    badge: "91% completion rate",
  },
  {
    title: "Podcast Sponsorship",
    description:
      "Host-read mentions on The Wire Report, our flagship daily podcast with 480K weekly listeners.",
    price: "From $1,800/episode",
    badge: "High brand recall",
  },
  {
    title: "Branded Content",
    description:
      "In-depth editorial partnerships produced by our content studio. Clearly labelled as sponsored.",
    price: "From $12,000",
    badge: "Custom measurement",
  },
];

export const PACKAGES: AdvertisePackage[] = [
  {
    name: "Standard",
    price: "$2,500",
    period: "/ month",
    description: "For brands beginning to explore quality journalism audiences.",
    features: [
      "Banner placements across homepage + category pages",
      "Basic audience targeting",
      "Monthly impression report",
      "Dedicated account setup",
    ],
    cta: "Get Started",
  },
  {
    name: "Premium",
    price: "$9,000",
    period: "/ month",
    description: "For brands wanting sustained, visible presence across ZBC News.",
    features: [
      "Everything in Standard",
      "Newsletter sponsorship (2×/month)",
      "Homepage takeover (1×/month)",
      "Retargeting audience",
      "Bi-weekly performance reporting",
      "A/B creative testing",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Full-scale partnerships with custom strategy and exclusivity options.",
    features: [
      "Everything in Premium",
      "Branded content studio partnership",
      "Podcast host reads",
      "Category exclusivity",
      "Direct sales account manager",
      "Quarterly strategy review",
    ],
    cta: "Contact Sales",
  },
];

export const CASE_STUDIES: AdvertiseCaseStudy[] = [
  {
    title: "Global Banking Group",
    rating: 5,
    summary:
      "42% increase in brand consideration among 35–55 HHI $120K+ readers after 8-week newsletter sponsorship.",
    image: ADVERTISE_ASSETS.bankingCaseStudy,
    imageAlt: "Global Banking Group case study",
  },
  {
    title: "EV Startup",
    rating: 4,
    summary:
      "Branded content series drove 3.2× the website traffic of their paid social campaigns at 60% lower CPM.",
    image: ADVERTISE_ASSETS.evCaseStudy,
    imageAlt: "EV Startup case study",
  },
];
