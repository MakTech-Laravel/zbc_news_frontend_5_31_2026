import { api } from "@/api/client";
import type {
  EngagedArticleItem,
  MonthlyTrendItem,
  ReadingAnalyticsData,
  ReadingAnalyticsMetric,
  ReadingCategoryItem,
  WeeklyActivityItem,
} from "@/types/readingAnalytics";

const CATEGORY_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#9ca3af",
  "#ef4444",
  "#06b6d4",
];

function formatReadingTime(minutes: number): string {
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function buildMetrics(stats: Record<string, unknown>): ReadingAnalyticsMetric[] {
  const articlesThisWeek = Number(stats.articles_this_week ?? 0);
  const readingTimeThisWeek = Number(stats.reading_time_this_week ?? 0);
  const avgPerDay = Number(stats.avg_per_day ?? 0);
  const completionRate = Number(stats.completion_rate ?? 0);

  return [
    {
      id: "articles",
      label: "Articles Read",
      value: String(articlesThisWeek),
      sublabel: "This week",
      icon: "book",
    },
    {
      id: "time",
      label: "Reading Time",
      value: formatReadingTime(readingTimeThisWeek),
      sublabel: "This week",
      icon: "clock",
    },
    {
      id: "avg-day",
      label: "Avg. Per Day",
      value: String(avgPerDay),
      sublabel: "This week",
      icon: "trending-up",
    },
    {
      id: "completion",
      label: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      sublabel: "Avg. this month",
      icon: "eye",
    },
  ];
}

function parseWeeklyActivity(raw: unknown): WeeklyActivityItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const day = typeof record.day === "string" ? record.day : "";
      if (!day) return null;
      return {
        day,
        count: Number(record.count ?? 0),
      };
    })
    .filter((item): item is WeeklyActivityItem => item !== null);
}

function parseByCategory(raw: unknown): ReadingCategoryItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const label =
        (typeof record.category === "string" && record.category) ||
        (typeof record.label === "string" && record.label) ||
        "";
      if (!label) return null;

      return {
        id: slugify(label),
        label,
        percent: Number(record.percentage ?? record.percent ?? 0),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
    })
    .filter((item): item is ReadingCategoryItem => item !== null);
}

function parseMonthlyTrend(raw: unknown): MonthlyTrendItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const month = typeof record.month === "string" ? record.month : "";
      if (!month) return null;
      return {
        month,
        count: Number(record.count ?? 0),
      };
    })
    .filter((item): item is MonthlyTrendItem => item !== null);
}

function parseMostEngaged(raw: unknown): EngagedArticleItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : "";
      const slug = typeof record.slug === "string" ? record.slug : "";
      if (!title) return null;

      return {
        id: slug || `engaged-${index + 1}`,
        rank: index + 1,
        title,
        slug,
        category:
          (typeof record.category === "string" && record.category) || "News",
        readTime:
          (typeof record.read_time === "string" && record.read_time) ||
          "5 min read",
        completionPercent: Number(record.completion ?? 0),
      };
    })
    .filter((item): item is EngagedArticleItem => item !== null);
}

function parseReadingAnalyticsResponse(body: unknown): ReadingAnalyticsData {
  const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const payload =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const stats =
    payload.stats && typeof payload.stats === "object"
      ? (payload.stats as Record<string, unknown>)
      : {};

  return {
    metrics: buildMetrics(stats),
    weeklyActivity: parseWeeklyActivity(payload.weekly_activity),
    byCategory: parseByCategory(payload.by_category),
    monthlyTrend: parseMonthlyTrend(payload.monthly_trend),
    mostEngaged: parseMostEngaged(payload.most_engaged),
  };
}

export async function fetchReadingAnalytics(): Promise<ReadingAnalyticsData> {
  const response = await api.get("/admin/users/reading-analytics");
  return parseReadingAnalyticsResponse(response.data);
}
