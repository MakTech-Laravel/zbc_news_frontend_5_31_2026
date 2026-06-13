import type { HeroStory } from "@/components/user/shared/UserHeroStoryCard";
import { worldImages } from "@/lib/worldImages";

export type WorldRegionId =
  | "all"
  | "asia"
  | "europe"
  | "americas"
  | "middle-east"
  | "africa";

export type WorldArticleRegion = Exclude<WorldRegionId, "all"> | "world";

export type WorldFeedArticle = {
  id: string;
  slug?: string;
  category: string;
  region: WorldArticleRegion;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  publishedAt: string;
};

export const worldRegionTabs: { id: WorldRegionId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "asia", label: "Asia" },
  { id: "europe", label: "Europe" },
  { id: "americas", label: "Americas" },
  { id: "middle-east", label: "Middle East" },
  { id: "africa", label: "Africa" },
];

export const worldHeroStory: HeroStory = {
  category: "Breaking",
  title: "Breaking: G20 Leaders Announce Global Economic Recovery Plan",
  excerpt: "Major economies pledge coordinated action to stabilize markets and support growth.",
  readTime: "4 min",
  views: 67890,
  imageUrl: worldImages.hero,
};

export const worldArticles: WorldFeedArticle[] = [
  {
    id: "w-1",
    category: "World",
    region: "world",
    title: "UN Climate Summit Reaches Historic Agreement on Carbon Reduction",
    excerpt:
      "World leaders from 195 nations commit to ambitious carbon reduction targets in landmark climate accord, marking a turning point in global environmental policy.",
    author: "Emma Rodriguez",
    readTime: "8 min read",
    publishedAt: "2 hours ago",
  },
  {
    id: "w-2",
    category: "Asia",
    region: "asia",
    title: "Asian Markets React to New Trade Partnership Agreement",
    excerpt:
      "Major Asian economies sign comprehensive trade deal expected to reshape regional commerce and strengthen economic ties.",
    author: "Li Wei",
    readTime: "6 min read",
    publishedAt: "4 hours ago",
  },
  {
    id: "w-3",
    category: "Europe",
    region: "europe",
    title: "European Union Announces Major Infrastructure Investment Plan",
    excerpt:
      "EU unveils €500 billion initiative to modernize transportation and digital infrastructure across member states.",
    author: "Sophie Müller",
    readTime: "7 min read",
    publishedAt: "6 hours ago",
  },
  {
    id: "w-4",
    category: "Middle East",
    region: "middle-east",
    title: "Middle East Peace Talks Show Signs of Progress",
    excerpt:
      "Diplomatic negotiations enter crucial phase as regional leaders work toward comprehensive peace framework.",
    author: "Ahmed Hassan",
    readTime: "9 min read",
    publishedAt: "8 hours ago",
  },
  {
    id: "w-5",
    category: "Americas",
    region: "americas",
    title: "Latin American Countries Launch Joint Space Initiative",
    excerpt:
      "Six nations collaborate on ambitious satellite program to advance telecommunications and environmental monitoring.",
    author: "Carlos Rivera",
    readTime: "5 min read",
    publishedAt: "10 hours ago",
  },
  {
    id: "w-6",
    category: "Africa",
    region: "africa",
    title: "Africa's Renewable Energy Revolution Gains Momentum",
    excerpt:
      "Continent leads global shift to clean energy with unprecedented solar and wind power investments.",
    author: "Amara Okafor",
    readTime: "7 min read",
    publishedAt: "12 hours ago",
  },
];

export const worldTopStoriesByRegion = [
  { id: "asia", label: "Asia", count: "7 new" },
  { id: "europe", label: "Europe", count: "9 new" },
  { id: "americas", label: "Americas", count: "15 new" },
] as const;

export const worldMostReadToday = [
  {
    rank: 1,
    title: "UN Climate Summit Reaches Historic Agreement on Carbon Reduction",
  },
  {
    rank: 2,
    title: "Asian Markets React to New Trade Partnership Agreement",
  },
  {
    rank: 3,
    title: "European Union Announces Major Infrastructure Investment Plan",
  },
] as const;

export const worldGlobalSpotlight = [
  {
    id: "climate",
    title: "Climate Action",
    description: "24 articles covering global sustainability efforts",
  },
  {
    id: "economic",
    title: "Economic Summit",
    description: "15 articles on international trade discussions",
  },
] as const;

export function filterWorldArticles(
  articles: WorldFeedArticle[],
  region: WorldRegionId,
): WorldFeedArticle[] {
  if (region === "all") return articles;
  return articles.filter((a) => a.region === region);
}
