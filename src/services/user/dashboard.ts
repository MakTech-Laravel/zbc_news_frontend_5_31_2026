import { request } from "@/api/request";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { UserFeedArticle } from "@/types/user";

export type UserFeaturedStory = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  readTime: string;
  views: number;
};

export type UserContinueReadingItem = {
  id: string;
  title: string;
  slug?: string;
  category: string;
  readTime: string;
  publishedAt: string;
};

export type UserTrendingTopic = {
  id: string;
  rank: number;
  label: string;
  slug?: string;
  count: number;
};

export type UserThisWeekStats = {
  articlesRead: { value: number; progress: number };
  readingTime: { value: string; progress: number };
};

export type UserDashboardFeeds = {
  recommended: UserFeedArticle[];
  latest: UserFeedArticle[];
  trending: UserFeedArticle[];
};

export type UserDashboardData = {
  featured_story: UserFeaturedStory | null;
  feeds: UserDashboardFeeds;
  continue_reading: UserContinueReadingItem[];
  trending_topics: UserTrendingTopic[];
  this_week: UserThisWeekStats;
};

function mapFeedArticle(raw: Record<string, unknown>): UserFeedArticle {
  return {
    id: String(raw.id ?? ""),
    title: (raw.title as string) ?? "",
    slug: (raw.slug as string) ?? "",
    excerpt: (raw.excerpt as string) ?? "",
    imageUrl: resolveMediaUrl((raw.imageUrl as string) ?? ""),
    category: (raw.category as string) ?? "General",
    categorySlug: (raw.categorySlug as string) ?? "general",
    readTime: (raw.readTime as string) ?? "3 min read",
    views: (raw.views as number) ?? 0,
    publishedAt: (raw.publishedAt as string) ?? "",
    author: (raw.author as string) ?? "",
  };
}

function mapFeeds(raw: Record<string, unknown>): UserDashboardFeeds {
  const toFeed = (arr: unknown) =>
    Array.isArray(arr) ? arr.map((a) => mapFeedArticle(a as Record<string, unknown>)) : [];
  return {
    recommended: toFeed(raw.recommended),
    latest: toFeed(raw.latest),
    trending: toFeed(raw.trending),
  };
}

export async function fetchUserDashboard(): Promise<UserDashboardData> {
  const response = await request.get("/admin/user/dashboard");
  const d = (response.data?.data ?? response.data) as Record<string, unknown>;

  return {
    featured_story: d.featured_story
      ? {
          ...(d.featured_story as UserFeaturedStory),
          imageUrl: resolveMediaUrl(
            ((d.featured_story as UserFeaturedStory).imageUrl as string) ?? "",
          ),
        }
      : null,
    feeds: mapFeeds((d.feeds ?? {}) as Record<string, unknown>),
    continue_reading: Array.isArray(d.continue_reading)
      ? (d.continue_reading as Array<Record<string, unknown>>).map((item) => ({
          ...(item as UserContinueReadingItem),
          id: String(item.id ?? ""),
        }))
      : [],
    trending_topics: Array.isArray(d.trending_topics)
      ? (d.trending_topics as Array<Record<string, unknown>>).map((t) => ({
          ...(t as UserTrendingTopic),
          id: String(t.id ?? ""),
        }))
      : [],
    this_week: (d.this_week as UserThisWeekStats) ?? {
      articlesRead: { value: 0, progress: 0 },
      readingTime: { value: "0 min", progress: 0 },
    },
  };
}
