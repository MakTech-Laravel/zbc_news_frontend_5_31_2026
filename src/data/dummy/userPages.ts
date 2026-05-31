import type { UserFeedArticle } from "@/data/dummy/userDashboard";

export type UserCategoryFilter = { id: string; label: string; count: number };

export const savedArticleCategories: UserCategoryFilter[] = [
  { id: "all", label: "All Articles", count: 24 },
  { id: "technology", label: "Technology", count: 8 },
  { id: "business", label: "Business", count: 6 },
  { id: "health", label: "Health", count: 5 },
  { id: "world", label: "World", count: 5 },
];

export const savedQuickFilters = ["Recently Saved", "Unread", "Favorites"] as const;

export const savedArticles: UserFeedArticle[] = [
  {
    id: "saved-1",
    category: "Technology",
    title: "Breakthrough in Renewable Energy Storage Technology",
    excerpt:
      "Scientists announce major advancement in battery technology that could revolutionize clean energy adoption worldwide.",
    author: "James Chen",
    readTime: "7 min read",
    publishedAt: "4 hours ago",
  },
  {
    id: "saved-2",
    category: "Business",
    title: "Global Markets Rally as Economic Data Exceeds Expectations",
    excerpt:
      "Stock markets worldwide surge following stronger-than-expected economic indicators from major economies.",
    author: "Sarah Mitchell",
    readTime: "5 min read",
    publishedAt: "6 hours ago",
  },
  {
    id: "saved-3",
    category: "Health",
    title: "AI Revolution Transforms Healthcare Diagnostics",
    excerpt:
      "New artificial intelligence system achieves 98% accuracy in early disease detection trials.",
    author: "Dr. Michael Park",
    readTime: "8 min read",
    publishedAt: "1 day ago",
  },
  {
    id: "saved-4",
    category: "World",
    title: "UN Climate Summit Reaches Historic Agreement",
    excerpt:
      "World leaders commit to ambitious carbon reduction targets in landmark international accord.",
    author: "Emma Rodriguez",
    readTime: "8 min read",
    publishedAt: "1 day ago",
  },
  {
    id: "saved-5",
    category: "Technology",
    title: "Major tech firms announce unified AI safety standards ahead of summit",
    excerpt:
      "Major tech firms announce unified AI safety standards ahead of summit.",
    author: "David Chen",
    readTime: "8 min read",
    publishedAt: "1 day ago",
  },
];

export type UserNotificationIcon =
  | "breaking"
  | "technology"
  | "recommended"
  | "reply"
  | "saved"
  | "business";

export type UserNotificationTab = "breaking" | "topic" | "system" | "social" | "saved";

export type UserNotification = {
  id: string;
  tab: UserNotificationTab;
  title: string;
  body: string;
  time: string;
  icon: UserNotificationIcon;
  unread?: boolean;
  showReadArticle?: boolean;
  showMarkRead?: boolean;
};

export const userNotifications: UserNotification[] = [
  {
    id: "n1",
    tab: "breaking",
    title: "Breaking News",
    body: "Global Markets Rally as Economic Data Exceeds Expectations",
    time: "5 minutes ago",
    icon: "breaking",
    unread: true,
    showReadArticle: true,
    showMarkRead: true,
  },
  {
    id: "n2",
    tab: "topic",
    title: "Technology",
    body: "New article in Technology: Breakthrough in Renewable Energy Storage Technology",
    time: "1 hour ago",
    icon: "technology",
    unread: true,
    showMarkRead: true,
  },
  {
    id: "n3",
    tab: "topic",
    title: "Recommended",
    body: "Based on your reading history: The Future of Urban Planning in Smart Cities",
    time: "2 hours ago",
    icon: "recommended",
    unread: true,
    showMarkRead: true,
  },
  {
    id: "n4",
    tab: "social",
    title: "New Reply",
    body: "Sarah Mitchell replied to your comment on 'Climate Policy Summit Coverage'",
    time: "3 hours ago",
    icon: "reply",
  },
  {
    id: "n5",
    tab: "saved",
    title: "Saved Article",
    body: "An article you saved has been updated with new information",
    time: "5 hours ago",
    icon: "saved",
  },
  {
    id: "n6",
    tab: "topic",
    title: "Business",
    body: "New article in Business: Understanding Global Trade Dynamics",
    time: "1 day ago",
    icon: "business",
  },
];

export type MembershipPlanId = "free" | "premium" | "premium-plus";

export type MembershipPlan = {
  id: MembershipPlanId;
  name: string;
  tagline: string;
  price: string;
  priceSuffix: string;
  features: string[];
  cta: string;
  ctaVariant: "upgrade" | "current" | "outline";
  highlighted?: boolean;
  badge?: string;
  current?: boolean;
};

export const membershipPlans: MembershipPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Perfect for casual readers",
    price: "$0",
    priceSuffix: "/forever",
    features: [
      "5 articles per month",
      "Basic news categories",
      "Email newsletter",
      "Standard support",
    ],
    cta: "Upgrade",
    ctaVariant: "outline",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Unlimited access to quality journalism",
    price: "$9.99",
    priceSuffix: "/per month",
    features: [
      "Unlimited articles",
      "Ad-free experience",
      "Exclusive content",
      "Reading analytics",
      "Offline reading",
      "Priority support",
      "Early access to features",
    ],
    cta: "Current Plan",
    ctaVariant: "current",
    highlighted: true,
    badge: "Most Popular",
    current: true,
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    tagline: "The complete premium experience",
    price: "$19.99",
    priceSuffix: "/per month",
    features: [
      "Everything in Premium",
      "Expert analysis & insights",
      "Live event access",
      "Archive access (10+ years)",
      "Personalized briefings",
      "1-on-1 consultation calls",
      "VIP support",
    ],
    cta: "Upgrade",
    ctaVariant: "upgrade",
  },
];

export const billingHistory = [
  { id: "inv-05", date: "May 1, 2026", invoice: "INV-2026-05", amount: "$9.99", status: "Paid" as const },
  { id: "inv-04", date: "Apr 1, 2026", invoice: "INV-2026-04", amount: "$9.99", status: "Paid" as const },
  { id: "inv-03", date: "Mar 1, 2026", invoice: "INV-2026-03", amount: "$9.99", status: "Paid" as const },
  { id: "inv-02", date: "Feb 1, 2026", invoice: "INV-2026-02", amount: "$9.99", status: "Paid" as const },
];

export const editorialFeatured = {
  category: "Featured Editorial",
  title: "The Future of Democracy: Navigating the Digital Age",
  excerpt:
    "As technology reshapes our society, we must reconsider how democratic institutions adapt to an interconnected world.",
  author: "Editorial Board",
  readTime: "12 min read",
  publishedAt: "3 days ago",
};

export const editorialArticles: UserFeedArticle[] = [
  {
    id: "ed-1",
    category: "Opinion",
    title: "Why Local Journalism Still Matters in a Global Media Landscape",
    excerpt: "Community reporting remains essential for accountability and civic engagement.",
    author: "Maria Santos",
    readTime: "9 min read",
    publishedAt: "1 day ago",
  },
  {
    id: "ed-2",
    category: "Analysis",
    title: "The Ethics of AI in Newsrooms",
    excerpt: "Balancing automation with editorial judgment in modern news production.",
    author: "David Kim",
    readTime: "11 min read",
    publishedAt: "4 days ago",
  },
];

