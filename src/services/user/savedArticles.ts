import type { SavedArticlesQuery, UserCategoryFilter, UserFeedArticle } from "@/types/user";
import {
  savedArticleCategories as dummyCategories,
  savedArticles as dummyArticles,
  savedQuickFilters,
} from "@/data/dummy/userPages";

export { savedQuickFilters };

/** Replace with API call when backend is ready. */
export async function fetchSavedArticleCategories(): Promise<UserCategoryFilter[]> {
  return dummyCategories.map((c) => ({ ...c }));
}

export async function fetchSavedArticles(
  _query?: SavedArticlesQuery,
): Promise<UserFeedArticle[]> {
  return dummyArticles.map((a) => ({ ...a }));
}
