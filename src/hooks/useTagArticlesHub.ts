import * as React from "react";

import { fetchReadingAnalytics } from "@/services/user/readingAnalytics";
import {
  buildTrendingTopicsFromArticles,
  fetchArticlesByTagRaw,
  fetchTagArticleFeeds,
  mapToFeaturedStory,
  toContinueReadingItem,
  type TagArticleFeeds,
  type UserContinueReadingItem,
  type UserFeaturedStoryData,
  type UserTrendingTopic,
} from "@/services/user/tagArticles";

export type TagArticlesHubSidebarData = {
  continueReading: UserContinueReadingItem[];
  trendingTopics: UserTrendingTopic[];
  thisWeek: {
    articlesRead: { value: number; progress: number };
    readingTime: { value: string; progress: number };
  };
};

export type TagArticlesHubData = {
  featuredStory: UserFeaturedStoryData | null;
  feeds: TagArticleFeeds;
  sidebar: TagArticlesHubSidebarData;
};

const EMPTY_FEEDS: TagArticleFeeds = {
  recommended: [],
  latest: [],
  trending: [],
};

function formatReadingTime(minutes: number): string {
  if (minutes <= 0) return "0 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

function buildThisWeekStats(articlesRead: number, readingMinutes: number) {
  const articlesProgress = Math.min(100, Math.round((articlesRead / 30) * 100));
  const timeProgress = Math.min(100, Math.round((readingMinutes / 300) * 100));

  return {
    articlesRead: { value: articlesRead, progress: articlesProgress },
    readingTime: { value: formatReadingTime(readingMinutes), progress: timeProgress },
  };
}

function buildTagArticlesHubData(
  feeds: TagArticleFeeds,
  trendingRows: Record<string, unknown>[],
  featuredStory: UserFeaturedStoryData | null,
  stats?: { articlesThisWeek: number; readingTimeThisWeek: number },
): TagArticlesHubData {
  return {
    featuredStory,
    feeds,
    sidebar: {
      continueReading: feeds.latest.slice(1, 3).map(toContinueReadingItem),
      trendingTopics: buildTrendingTopicsFromArticles(trendingRows),
      thisWeek: buildThisWeekStats(
        stats?.articlesThisWeek ?? feeds.latest.length,
        stats?.readingTimeThisWeek ?? 0,
      ),
    },
  };
}

export function useTagArticlesHub(tagSlug: string, errorLabel = "articles") {
  const [data, setData] = React.useState<TagArticlesHubData>(() =>
    buildTagArticlesHubData(EMPTY_FEEDS, [], null),
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchTagArticleFeeds(tagSlug),
      fetchArticlesByTagRaw(tagSlug, "latest"),
      fetchArticlesByTagRaw(tagSlug, "trending"),
      fetchReadingAnalytics().catch(() => null),
    ])
      .then(([feeds, latestRows, trendingRows, analytics]) => {
        if (cancelled) return;

        const featuredStory = latestRows[0] ? mapToFeaturedStory(latestRows[0]) : null;
        const articlesThisWeek = Number(
          analytics?.metrics.find((metric) => metric.id === "articles")?.value ??
            feeds.latest.length,
        );

        setData(
          buildTagArticlesHubData(feeds, trendingRows, featuredStory, {
            articlesThisWeek: Number.isNaN(articlesThisWeek)
              ? feeds.latest.length
              : articlesThisWeek,
            readingTimeThisWeek: 0,
          }),
        );
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(buildTagArticlesHubData(EMPTY_FEEDS, [], null));
        setError(err instanceof Error ? err.message : `Failed to load ${errorLabel}`);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tagSlug, errorLabel]);

  return { data, loading, error };
}
