import * as React from "react";

import {
  fetchSavedArticles,
  savedQuickFilters,
} from "@/services/user/savedArticles";
import type { SavedArticlesQuery, UserCategoryFilter, UserFeedArticle } from "@/types/user";

function buildCategoriesFromArticles(articles: UserFeedArticle[]): UserCategoryFilter[] {
  const categoryMap = new Map<string, UserCategoryFilter>();

  for (const article of articles) {
    const key = article.categorySlug || article.category;
    const existing = categoryMap.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    categoryMap.set(key, {
      id: key,
      label: article.category,
      count: 1,
    });
  }

  return [
    { id: "all", label: "All Categories", count: articles.length },
    ...Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
  ];
}

export function useSavedArticles(query?: SavedArticlesQuery) {
  const [articles, setArticles] = React.useState<UserFeedArticle[]>([]);
  const [categories, setCategories] = React.useState<UserCategoryFilter[]>([]);
  const [loading, setLoading] = React.useState(true);

  const queryKey = JSON.stringify(query ?? {});

  const refresh = React.useCallback(() => {
    setLoading(true);
    return fetchSavedArticles(query).then((a) => {
      setArticles(a);
      setCategories(buildCategoriesFromArticles(a));
      setLoading(false);
      return a;
    });
  }, [queryKey]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSavedArticles(query).then((a) => {
      if (!cancelled) {
        setArticles(a);
        setCategories(buildCategoriesFromArticles(a));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  return { articles, categories, quickFilters: savedQuickFilters, loading, refresh };
}
