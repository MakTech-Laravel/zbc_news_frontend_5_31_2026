import type { ArticleFeaturedMedia } from "@/components/main-layout/shared/media/types";

export type Article = {
  id: string;
  slug?: string;
  category: string;
  title: string;
  excerpt?: string;
  imageUrl: string;
  featuredMedia?: ArticleFeaturedMedia | null;
  author: string;
  readTime: string;
  /** Formatted publish date/time for display fallback. */
  publishedAt: string;
  publishedAtIso?: string;
  updatedAtIso?: string;
  views?: number;
  commentCount?: number;
  tags?: string[];
  isLive?: boolean;
  isLiveBlog?: boolean;
  liveEndedAtIso?: string;
  /** 1-based display rank from curated feeds (sub-menu items). */
  serial?: number;
};

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type MostReadItem = {
  id: string;
  rank: number;
  title: string;
  publishedAt: string;
  views: number;
};

export type TrendingTag = {
  id: string;
  label: string;
  href: string;
};

export type WeatherDay = {
  label: string;
  high: number;
  low: number;
  icon: "sun" | "cloud" | "rain";
};
