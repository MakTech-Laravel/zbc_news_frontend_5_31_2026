export type UserFeedArticle = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  publishedAt: string;
  views?: number;
  slug?: string;
  savedRecordId?: string;
  savedAt?: string;
  categorySlug?: string;
};

export type UserContinueReadingItem = {
  id: string;
  category: string;
  title: string;
  readTime: string;
  publishedAt: string;
};

export type UserTrendingTopic = {
  id: string;
  rank: number;
  label: string;
  count: number;
};

export const userFeaturedStory = {
  category: "Business",
  title: "Global Markets Rally as Economic Data Exceeds Expectations",
  excerpt:
    "Stock markets worldwide surge following stronger-than-expected economic indicators from major economies, signaling renewed investor confidence.",
  readTime: "5 min",
  views: 15234,
  imageUrl:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=500&fit=crop",
};

export const userFeedArticles: UserFeedArticle[] = [
  {
    id: "feed-1",
    category: "Technology",
    title: "Breakthrough in Renewable Energy Storage Technology",
    excerpt:
      "Scientists announce major advancement in battery technology that could revolutionize clean energy adoption worldwide.",
    author: "James Chen",
    readTime: "7 min read",
    publishedAt: "4 hours ago",
  },
  {
    id: "feed-2",
    category: "World",
    title: "UN Climate Summit Reaches Historic Agreement",
    excerpt:
      "World leaders commit to ambitious carbon reduction targets in landmark international accord.",
    author: "Emma Rodriguez",
    readTime: "6 min read",
    publishedAt: "5 hours ago",
  },
  {
    id: "feed-3",
    category: "Health",
    title: "AI Revolution Transforms Healthcare Diagnostics",
    excerpt:
      "New artificial intelligence system achieves 98% accuracy in early disease detection trials.",
    author: "Dr. Michael Park",
    readTime: "8 min read",
    publishedAt: "1 day ago",
  },
];

export const userContinueReading: UserContinueReadingItem[] = [
  {
    id: "cr-1",
    category: "Technology",
    title: "The Future of Urban Planning in Smart Cities",
    readTime: "12 min read",
    publishedAt: "Yesterday",
  },
  {
    id: "cr-2",
    category: "Business",
    title: "Understanding the New Global Trade Agreements",
    readTime: "10 min read",
    publishedAt: "2 days ago",
  },
];

export const userTrendingTopics: UserTrendingTopic[] = [
  { id: "t1", rank: 1, label: "Climate Policy", count: 234 },
  { id: "t2", rank: 2, label: "Tech Innovation", count: 189 },
  { id: "t3", rank: 3, label: "Global Markets", count: 156 },
  { id: "t4", rank: 4, label: "Healthcare", count: 143 },
  { id: "t5", rank: 5, label: "Space Exploration", count: 128 },
];

export const userThisWeekStats = {
  articlesRead: { value: 24, progress: 75 },
  readingTime: { value: "3.5 hrs", progress: 60 },
};
