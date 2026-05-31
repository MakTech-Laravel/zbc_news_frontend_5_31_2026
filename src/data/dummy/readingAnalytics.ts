export type ReadingMetricIcon = "book" | "clock" | "trending-up" | "eye";

export type ReadingAnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  icon: ReadingMetricIcon;
  sublabelTone?: "default" | "positive";
};

export const readingAnalyticsMetrics: ReadingAnalyticsMetric[] = [
  {
    id: "articles",
    label: "Articles Read",
    value: "24",
    sublabel: "This week",
    icon: "book",
  },
  {
    id: "time",
    label: "Reading Time",
    value: "3.5 hrs",
    sublabel: "This week",
    icon: "clock",
  },
  {
    id: "avg-day",
    label: "Avg. Per Day",
    value: "3.4",
    sublabel: "+12% from last week",
    icon: "trending-up",
    sublabelTone: "positive",
  },
  {
    id: "completion",
    label: "Completion Rate",
    value: "87%",
    sublabel: "Avg. this month",
    icon: "eye",
  },
];

export const weeklyActivityData = [
  { day: "Mon", articles: 5 },
  { day: "Tue", articles: 8 },
  { day: "Wed", articles: 4 },
  { day: "Thu", articles: 9 },
  { day: "Fri", articles: 6 },
  { day: "Sat", articles: 8 },
  { day: "Sun", articles: 10 },
] as const;

export const readingCategoryData = [
  { id: "technology", label: "Technology", percent: 35, color: "#3b82f6" },
  { id: "business", label: "Business", percent: 25, color: "#10b981" },
  { id: "science", label: "Science", percent: 20, color: "#8b5cf6" },
  { id: "world", label: "World", percent: 12, color: "#f59e0b" },
  { id: "other", label: "Other", percent: 8, color: "#9ca3af" },
] as const;

export const readingTrendData = [
  { month: "Jan", articles: 45 },
  { month: "Feb", articles: 52 },
  { month: "Mar", articles: 58 },
  { month: "Apr", articles: 64 },
  { month: "May", articles: 72 },
] as const;

export type MostEngagedArticle = {
  id: string;
  rank: number;
  category: string;
  title: string;
  readTime: string;
  completionPercent: number;
};

export const mostEngagedArticles: MostEngagedArticle[] = [
  {
    id: "eng-1",
    rank: 1,
    category: "Technology",
    title: "Breakthrough in Renewable Energy Storage Technology",
    readTime: "12 min read",
    completionPercent: 95,
  },
  {
    id: "eng-2",
    rank: 2,
    category: "Business",
    title: "Global Markets Rally as Economic Data Exceeds Expectations",
    readTime: "8 min read",
    completionPercent: 88,
  },
  {
    id: "eng-3",
    rank: 3,
    category: "Health",
    title: "AI Revolution Transforms Healthcare Diagnostics",
    readTime: "10 min read",
    completionPercent: 82,
  },
];
