import { BREAKING_NEWS_TAG_SLUG } from "@/services/user/tagArticles";
import {
  useTagArticlesHub,
  type TagArticlesHubData,
  type TagArticlesHubSidebarData,
} from "@/hooks/useTagArticlesHub";

export type BreakingNewsData = TagArticlesHubData;
export type BreakingNewsSidebarData = TagArticlesHubSidebarData;

export function useBreakingNews(tagSlug: string = BREAKING_NEWS_TAG_SLUG) {
  return useTagArticlesHub(tagSlug, "breaking news");
}
