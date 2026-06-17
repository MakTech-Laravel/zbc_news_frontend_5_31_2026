import * as React from "react";

import {
  clearSearchHistory,
  fetchSearchHistory,
  saveSearchHistory,
  searchArticles,
  type SearchHistoryItem,
  type SearchResultItem,
} from "@/services/frontend/search";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

export function useGlobalSearch(open: boolean) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [history, setHistory] = React.useState<SearchHistoryItem[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadHistory = React.useCallback(async () => {
    setHistoryLoading(true);
    try {
      const items = await fetchSearchHistory();
      setHistory(items);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setSearching(false);
      return;
    }

    void loadHistory();
  }, [open, loadHistory]);

  React.useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    setSearching(true);
    setError(null);

    const timer = window.setTimeout(() => {
      searchArticles(trimmed)
        .then((items) => {
          setResults(items);
        })
        .catch((err: unknown) => {
          setResults([]);
          setError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => {
          setSearching(false);
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  const recordSearch = React.useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) return;

      try {
        await saveSearchHistory(trimmed);
        await loadHistory();
      } catch {
        // non-blocking
      }
    },
    [loadHistory],
  );

  const clearHistory = React.useCallback(async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch {
      // ignore
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    history,
    searching,
    historyLoading,
    error,
    recordSearch,
    clearHistory,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
