import type { NavItem, TrendingTag, WeatherDay } from "./types";

export const weatherLocation = {
  city: "New York",
  state: "NY",
  temperature: 72,
  condition: "Partly Cloudy",
};

export const weatherForecast: WeatherDay[] = [
  { label: "Mon", high: 74, low: 62, icon: "sun" },
  { label: "Tue", high: 71, low: 60, icon: "cloud" },
  { label: "Wed", high: 68, low: 58, icon: "rain" },
];

export const sidebarNavItems: NavItem[] = [
  { label: "Finance", href: "/business", icon: "finance" },
  { label: "Sports", href: "/sports", icon: "sports" },
  { label: "Mail", href: "/", icon: "mail" },
  { label: "Search", href: "/", icon: "search" },
  { label: "Weather", href: "/", icon: "weather" },
  { label: "Games", href: "/sports", icon: "games" },
  { label: "Shopping", href: "/entertainment", icon: "shopping" },
  { label: "Health", href: "/technology", icon: "health" },
  { label: "Creators", href: "/technology", icon: "creators" },
  { label: "Entertainment", href: "/entertainment", icon: "entertainment" },
  { label: "Technology", href: "/technology", icon: "technology" },
  { label: "Newsletters", href: "/", icon: "newsletters" },
  { label: "Feedback", href: "/", icon: "feedback" },
];

export const mostReadItems = [
  {
    id: "mr-1",
    rank: 1,
    title: "Federal Reserve signals extended pause on rate hikes through Q3 Federal Reserve signals extended pause on rate hikes through Q3 ",
    publishedAt: "2h ago",
    views: 1000,
  },
  {
    id: "mr-2",
    rank: 2,
    title: "Champions League final ticket demand breaks Wembley records Champions League final ticket demand breaks Wembley records ",
    publishedAt: "3h ago",
    views: 1000,
  },
  {
    id: "mr-3",
    rank: 3,
    title: "EU climate ministers reach breakthrough accord in Brussels EU climate ministers reach breakthrough accord in Brussels ",
    publishedAt: "4h ago",
    views: 1000,
  },
  {
    id: "mr-4",
    rank: 4,
    title: "Tech giants unveil joint AI safety framework ahead of summit Tech giants unveil joint AI safety framework ahead of summit ",
    publishedAt: "5h ago",
    views: 1000,
  },
  {
    id: "mr-5",
    rank: 5,
    title: "Markets rally as inflation cools faster than economists forecast Markets rally as inflation cools faster than economists forecast ",
    publishedAt: "6h ago",
    views: 1000,
  },
] satisfies import("./types").MostReadItem[];

export const trendingTags: TrendingTag[] = [
  { id: "t1", label: "#FederalReserve", href: "/news-details" },
  { id: "t2", label: "#InterestRates", href: "/news-details" },
  { id: "t3", label: "#Research", href: "/news-details" },
  { id: "t4", label: "#ChampionsLeague", href: "/news-details" },
  { id: "t5", label: "#Climate", href: "/news-details" },
  { id: "t6", label: "#AI", href: "/news-details" },
  { id: "t7", label: "#Markets", href: "/news-details" },
  { id: "t8", label: "#Election2026", href: "/news-details" },
];
