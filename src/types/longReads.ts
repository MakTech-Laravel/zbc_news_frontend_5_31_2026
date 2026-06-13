export type LongReadTab = "all" | "most-read";

export type LongReadArticle = {
  id: string;
  slug?: string;
  category: string;
  title: string;
  description: string;
  author: string;
  readTime: string;
  views: number;
  imageUrl: string;
};

export type LongReadCollection = {
  id: string;
  label: string;
  count: number;
};

export type LongReadStats = {
  articles: number;
  averageReadTime: string;
};

export type LongReadLengthFilter = {
  id: string;
  label: string;
};

export function formatViewCount(views: number): string {
  return `${views.toLocaleString()} views`;
}

export function filterLongReadArticles(
  articles: LongReadArticle[],
  tab: LongReadTab,
): LongReadArticle[] {
  if (tab === "most-read") {
    return [...articles].sort((a, b) => b.views - a.views);
  }
  return articles;
}
