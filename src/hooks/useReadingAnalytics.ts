import * as React from "react";

import { fetchReadingAnalytics } from "@/services/user/readingAnalytics";
import type { ReadingAnalyticsData } from "@/types/readingAnalytics";

const EMPTY_DATA: ReadingAnalyticsData = {
  metrics: [],
  weeklyActivity: [],
  byCategory: [],
  monthlyTrend: [],
  mostEngaged: [],
};

export function useReadingAnalytics() {
  const [data, setData] = React.useState<ReadingAnalyticsData>(EMPTY_DATA);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetchReadingAnalytics()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setData(EMPTY_DATA);
          setError(
            err instanceof Error ? err.message : "Failed to load reading analytics",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
