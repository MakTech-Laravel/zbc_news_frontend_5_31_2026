export const ARTICLE_VISIBILITY_VALUES = ["public", "members", "premium"] as const;

export type ArticleVisibility = (typeof ARTICLE_VISIBILITY_VALUES)[number];

export const ARTICLE_VISIBILITY_LABELS: Record<ArticleVisibility, string> = {
  public: "Public",
  members: "Members",
  premium: "Premium",
};

export function normalizeArticleVisibility(value: unknown): ArticleVisibility {
  const visibility = typeof value === "string" ? value : "";
  if (
    visibility === "public" ||
    visibility === "members" ||
    visibility === "premium"
  ) {
    return visibility;
  }
  return "public";
}
