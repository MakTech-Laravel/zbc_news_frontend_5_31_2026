export type ArticleStatus = "published" | "draft" | "scheduled" | "pending_review" | "archived";

export type AdminArticle = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  status: ArticleStatus;
  views: number;
  date: string;
  /** ISO timestamp of the last manual or auto-save */
  lastSavedAt?: string | null;
  /** True when the editor has unsaved changes (dummy local flag) */
  hasUnsavedDraft?: boolean;
};

export const MOCK_ADMIN_ARTICLES: AdminArticle[] = [
  {
    id: "1",
    slug: "global-climate-summit-reaches-historic-agreement",
    title: "Global Climate Summit Reaches Historic Agreement",
    author: "John Doe",
    category: "Politics",
    status: "published",
    views: 125_400,
    date: "5/9/2026",
    lastSavedAt: "2026-05-09T14:30:00.000Z",
  },
  {
    id: "2",
    slug: "tech-giant-announces-breakthrough-in-ai-technology",
    title: "Tech Giant Announces Breakthrough in AI Technology",
    author: "Jane Smith",
    category: "Technology",
    status: "pending_review",
    views: 98_200,
    date: "5/8/2026",
  },
  {
    id: "3",
    slug: "major-sports-championship-final-results",
    title: "Major Sports Championship Final Results",
    author: "Mike Johnson",
    category: "Sports",
    status: "draft",
    views: 0,
    date: "5/7/2026",
    lastSavedAt: "2026-05-07T09:15:00.000Z",
    hasUnsavedDraft: true,
  },
  {
    id: "4",
    slug: "new-study-reveals-health-benefits-of-mediterranean-diet",
    title: "New Study Reveals Health Benefits of Mediterranean Diet",
    author: "Sarah Williams",
    category: "Health",
    status: "archived",
    views: 76_300,
    date: "5/6/2026",
  },
  {
    id: "5",
    slug: "stock-market-hits-all-time-high",
    title: "Stock Market Hits All-Time High",
    author: "David Brown",
    category: "Business",
    status: "scheduled",
    views: 12_450,
    date: "5/5/2026",
  },
  {
    id: "6",
    slug: "the-future-of-ai-in-healthcare",
    title: "The Future of AI in Healthcare",
    author: "David Brown",
    category: "Business",
    status: "published",
    views: 12_450,
    date: "5/5/2026",
  },
  {
    id: "7",
    slug: "the-future-of-ai-in-education",
    title: "The Future of AI in Education",
    author: "David Brown",
    category: "Business",
    status: "scheduled",
    views: 12_450,
    date: "5/5/2026",
  },
  {
    id: "8",
    slug: "the-future-of-ai-in-finance",
    title: "The Future of AI in Finance",
    author: "David Brown",
    category: "Business",
    status: "scheduled",
    views: 12_450,
    date: "5/5/2026",
  },
  {
    id: "9",
    slug: "the-future-of-ai-in-energy",
    title: "The Future of AI in Energy",
    author: "David Brown",
    category: "Business",
    status: "scheduled",
    views: 12_450,
    date: "5/5/2026",
  },
];

export const ARTICLE_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

/** @deprecated Use getArticleCategoryFilterOptions from categoryStore */
export const ARTICLE_CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Politics", label: "Politics" },
  { value: "Technology", label: "Technology" },
  { value: "Sports", label: "Sports" },
  { value: "Health", label: "Health" },
  { value: "Business", label: "Business" },
] as const;
