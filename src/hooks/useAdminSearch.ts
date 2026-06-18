import * as React from "react";

import { searchAdminPanel, type AdminSearchResults } from "@/services/admin/search";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

const EMPTY_RESULTS: AdminSearchResults = {
  articles: [],
  users: [],
  categories: [],
  media: [],
  comments: [],
  total: 0,
};

export function useAdminSearch(open: boolean) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<AdminSearchResults>(EMPTY_RESULTS);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setResults(EMPTY_RESULTS);
      setError(null);
      setSearching(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults(EMPTY_RESULTS);
      setSearching(false);
      setError(null);
      return;
    }

    setSearching(true);
    setError(null);

    const timer = window.setTimeout(() => {
      searchAdminPanel(trimmed)
        .then(setResults)
        .catch((err: unknown) => {
          setResults(EMPTY_RESULTS);
          setError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => setSearching(false));
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  return {
    query,
    setQuery,
    results,
    searching,
    error,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
