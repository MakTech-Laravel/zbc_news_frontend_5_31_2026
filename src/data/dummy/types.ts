export type Article = {
  id: string;
  category: string;
  title: string;
  excerpt?: string;
  imageUrl: string;
  author: string;
  readTime: string;
  publishedAt: string;
  views?: number;
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
