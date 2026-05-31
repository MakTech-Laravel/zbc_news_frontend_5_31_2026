import { homeImages } from "@/lib/homeImages";

import type { Article } from "./types";

export const heroArticle: Article = {
  id: "hero-1",
  category: "Sports",
  title:
    "Champions League Final: Real Madrid vs. Manchester City Set for Wembley Showdown",
  excerpt:
    "Europe's elite clubs prepare for a historic night under the London lights as millions tune in worldwide.",
  imageUrl: homeImages.heroSports,
  author: "ZBC Sports Desk",
  readTime: "6 min read",
  publishedAt: "May 18, 2026",
};

export const featuredCategories = [
  "Originals",
  "Action",
  "Drama",
  "Indie",
  "Horror",
];

export const featuredSpotlight = {
  title: "Breakthrough mRNA Therapy Shows 94% Efficacy Against Treatment-Resistant Cancers",
  subtitle: "Exclusive limited series — Season 2 premieres this week",
  author: "ZBC Sports Desk",
  readTime: "10 min read",
  publishedAt: "May 19, 2026",
  imageUrl: homeImages.featuredCrown,
};

export const gridArticles: Article[] = [
  {
    id: "grid-1",
    category: "World News",
    title: "UN envoy arrives in Geneva as ceasefire talks enter critical phase",
    imageUrl: homeImages.gridWorld,
    author: "Sarah Mitchell",
    readTime: "4 min read",
    publishedAt: "May 18, 2026",
    views: 1000,
  },
  {
    id: "grid-2",
    category: "Business",
    title: "Dow surges 847 points as Fed signals extended pause on rate hikes",
    imageUrl: homeImages.gridBusiness,
    author: "James Porter",
    readTime: "5 min read",
    publishedAt: "May 18, 2026",
    views: 1000,
  },
  {
    id: "grid-3",
    category: "Politics",
    title: "Senate committee advances landmark climate investment package",
    imageUrl: homeImages.gridPolitics,
    author: "Elena Vasquez",
    readTime: "7 min read",
    publishedAt: "May 17, 2026",
    views: 1000,
  },
  {
    id: "grid-4",
    category: "Technology",
    title: "Major tech firms announce unified AI safety standards ahead of summit",
    imageUrl: homeImages.gridTechnology,
    author: "David Chen",
    readTime: "3 min read",
    publishedAt: "May 17, 2026",
    views: 1000,
  },
];

export const latestStories: Article[] = [
  {
    id: "latest-1",
    category: "Entertainment",
    title: "Streaming giants compete for rights to award-winning documentary series",
    imageUrl: homeImages.latestEntertainment,
    author: "Maya Brooks",
    readTime: "3 min read",
    publishedAt: "9:41 AM",
    views: 1000,
  },
  {
    id: "latest-2",
    category: "Health",
    title: "CDC releases updated guidance on seasonal respiratory illness prevention",
    imageUrl: homeImages.latestHealth,
    author: "Dr. Alan Reed",
    readTime: "5 min read",
    publishedAt: "9:28 AM",
    views: 1000,
  },
  {
    id: "latest-3",
    category: "World News",
    title: "Climate accord in Brussels draws support from 27 member nations",
    imageUrl: homeImages.latestClimate,
    author: "Claire Dubois",
    readTime: "4 min read",
    publishedAt: "9:12 AM",
    views: 1000,
  },
  {
    id: "latest-4",
    category: "Sports",
    title: "NBA playoffs: Underdogs force Game 7 in stunning overtime finish",
    imageUrl: homeImages.latestSports,
    author: "Marcus Lee",
    readTime: "2 min read",
    publishedAt: "8:55 AM",
    views: 1000,
  },
  {
    id: "latest-5",
    category: "Business",
    title: "Oil prices steady as OPEC+ maintains production targets into summer",
    imageUrl: homeImages.latestOil,
    author: "Priya Shah",
    readTime: "4 min read",
    publishedAt: "8:30 AM",
    views: 1000,
  },
];
