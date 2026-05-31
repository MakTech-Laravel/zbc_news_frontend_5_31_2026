export type ArticleEditorForm = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  excerpt: string;
  slug: string;
  scheduledAt: string;
  authorId: string;
  featuredImage: File | null;
  featuredImagePreview: string | null;
};

export const ARTICLE_EDITOR_CATEGORIES = [
  { value: "", label: "Select Category" },
  { value: "Politics", label: "Politics" },
  { value: "Technology", label: "Technology" },
  { value: "Sports", label: "Sports" },
  { value: "Health", label: "Health" },
  { value: "Business", label: "Business" },
  { value: "Lifestyle", label: "Lifestyle" },
] as const;

export const ARTICLE_EDITOR_AUTHORS = [
  { value: "", label: "Select Author" },
  { value: "john", label: "John Doe" },
  { value: "jane", label: "Jane Smith" },
  { value: "mike", label: "Mike Johnson" },
] as const;

export const EXCERPT_MAX_LENGTH = 160;
