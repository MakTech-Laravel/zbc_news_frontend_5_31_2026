import type { Article } from "@/data/dummy/types";

export type AuthorSocialLinks = {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
};

export type PublicAuthor = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  profileImageUrl?: string;
  bio?: string;
  publicTitle?: string;
  socialLinks?: AuthorSocialLinks;
  publishedArticlesCount: number;
};

export type AuthorProfileMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type AuthorProfileResult = {
  author: PublicAuthor;
  articles: Article[];
  meta: AuthorProfileMeta;
};
