import * as React from "react";

import {
  fetchLongReads,
  getLongReadsForTab,
  type LongReadsData,
} from "@/services/user/longReads";
import type { LongReadTab } from "@/types/longReads";

const EMPTY_DATA: LongReadsData = {
  articles: [],
  stats: { articles: 0, averageReadTime: "—" },
  collections: [],
};

export function useLongReads(activeTab: LongReadTab) {
  const [data, setData] = React.useState<LongReadsData>(EMPTY_DATA);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetchLongReads()
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
          setError(err instanceof Error ? err.message : "Failed to load long reads");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const articles = React.useMemo(
    () => getLongReadsForTab(data, activeTab),
    [data, activeTab],
  );

  return { data, articles, loading, error };
}
