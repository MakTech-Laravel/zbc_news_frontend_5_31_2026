import type { ReadingMetricIcon } from "@/data/dummy/readingAnalytics";

export type ReadingAnalyticsStats = {
  articlesThisWeek: number;
  readingTimeThisWeek: number;
  avgPerDay: number;
  completionRate: number;
};

export type WeeklyActivityItem = {
  day: string;
  count: number;
};

export type ReadingCategoryItem = {
  id: string;
  label: string;
  percent: number;
  color: string;
};

export type MonthlyTrendItem = {
  month: string;
  count: number;
};

export type EngagedArticleItem = {
  id: string;
  rank: number;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  completionPercent: number;
};

export type ReadingAnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  icon: ReadingMetricIcon;
  sublabelTone?: "default" | "positive";
};

export type ReadingAnalyticsData = {
  metrics: ReadingAnalyticsMetric[];
  weeklyActivity: WeeklyActivityItem[];
  byCategory: ReadingCategoryItem[];
  monthlyTrend: MonthlyTrendItem[];
  mostEngaged: EngagedArticleItem[];
};
