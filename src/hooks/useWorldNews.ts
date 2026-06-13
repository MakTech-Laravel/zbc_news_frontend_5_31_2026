import { WORLD_NEWS_TAG_SLUG } from "@/services/user/tagArticles";
import { useTagArticlesHub } from "@/hooks/useTagArticlesHub";

export function useWorldNews(tagSlug: string = WORLD_NEWS_TAG_SLUG) {
  return useTagArticlesHub(tagSlug, "world news");
}
