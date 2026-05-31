import * as React from "react";

import {
  fetchSavedArticleCategories,
  fetchSavedArticles,
  savedQuickFilters,
} from "@/services/user/savedArticles";
import type { SavedArticlesQuery, UserCategoryFilter, UserFeedArticle } from "@/types/user";

export function useSavedArticles(query?: SavedArticlesQuery) {
  const [articles, setArticles] = React.useState<UserFeedArticle[]>([]);
  const [categories, setCategories] = React.useState<UserCategoryFilter[]>([]);
  const [loading, setLoading] = React.useState(true);

  const queryKey = JSON.stringify(query ?? {});

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchSavedArticles(query), fetchSavedArticleCategories()]).then(
      ([a, c]) => {
        if (!cancelled) {
          setArticles(a);
          setCategories(c);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  return { articles, categories, quickFilters: savedQuickFilters, loading };
}
