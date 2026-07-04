import type { Article } from "@/data/dummy/types";
import type { PublicAuthor } from "@/types/author";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80";

function buildMockArticle(
  id: string,
  slug: string,
  title: string,
  category: string,
  author: string,
  index: number,
): Article {
  return {
    id,
    slug,
    category,
    title,
    excerpt: `A concise summary of "${title}" for the author profile listing.`,
    imageUrl: `https://picsum.photos/seed/${slug}/800/500`,
    author,
    readTime: `${4 + (index % 5)} min read`,
    publishedAt: "Mar 12, 2026",
    publishedAtIso: "2026-03-12T10:00:00.000Z",
    views: 1200 + index * 87,
  };
}

function buildAuthorArticles(authorName: string, slugPrefix: string, count: number): Article[] {
  const categories = ["Politics", "Business", "World", "Technology", "Sports"];

  return Array.from({ length: count }, (_, index) =>
    buildMockArticle(
      `${slugPrefix}-${index + 1}`,
      `${slugPrefix}-story-${index + 1}`,
      `${authorName.split(" ")[0]}'s Report ${index + 1}: Inside the Headlines`,
      categories[index % categories.length],
      authorName,
      index,
    ),
  );
}

export const MOCK_PUBLIC_AUTHORS: PublicAuthor[] = [
  {
    id: "1",
    slug: "sarah-johnson",
    name: "Sarah Johnson",
    initials: "SJ",
    profileImageUrl: PLACEHOLDER_IMAGE,
    publicTitle: "Editor-in-Chief",
    bio: "Sarah Johnson is an award-winning journalist with more than 20 years of experience covering politics, policy, and investigative reporting. She leads the ZBC News editorial team with a focus on accuracy, transparency, and public interest journalism.",
    socialLinks: {
      twitter: "https://twitter.com/",
      linkedin: "https://linkedin.com/",
      website: "https://example.com/",
    },
    publishedArticlesCount: 14,
  },
  {
    id: "2",
    slug: "marcus-chen",
    name: "Marcus Chen",
    initials: "MC",
    profileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Marcus Chen reports on global affairs and diplomatic developments across Asia, Europe, and the Americas.",
    publishedArticlesCount: 8,
  },
  {
    id: "3",
    slug: "zbc-news",
    name: "ZBC News",
    initials: "ZN",
    publicTitle: "Editorial Desk",
    bio: "Official coverage and updates from the ZBC News editorial team.",
    publishedArticlesCount: 3,
  },
];

const MOCK_ARTICLES_BY_AUTHOR_SLUG: Record<string, Article[]> = {
  "sarah-johnson": buildAuthorArticles("Sarah Johnson", "sarah-johnson", 14),
  "marcus-chen": buildAuthorArticles("Marcus Chen", "marcus-chen", 8),
  "zbc-news": buildAuthorArticles("ZBC News", "zbc-news", 3),
};

function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ZN"
  );
}

export function findMockPublicAuthor(slug: string): PublicAuthor | undefined {
  return MOCK_PUBLIC_AUTHORS.find((author) => author.slug === slug);
}

/**
 * UI-only fallback so any /author/{slug} route shows the profile design
 * until the backend author API is connected.
 */
export function buildFallbackMockAuthor(slug: string): PublicAuthor {
  const name = slugToDisplayName(slug) || "ZBC News Author";

  return {
    id: `fallback-${slug}`,
    slug,
    name,
    initials: toInitials(name),
    profileImageUrl: PLACEHOLDER_IMAGE,
    publicTitle: "Correspondent",
    bio: `${name} covers news and in-depth stories for ZBC News. This is placeholder profile content for UI preview until author data is loaded from the API.`,
    socialLinks: {
      twitter: "https://twitter.com/",
      linkedin: "https://linkedin.com/",
    },
    publishedArticlesCount: 8,
  };
}

export function resolveMockPublicAuthor(slug: string): PublicAuthor {
  return findMockPublicAuthor(slug) ?? buildFallbackMockAuthor(slug);
}

export function getMockAuthorArticles(slug: string): Article[] {
  if (MOCK_ARTICLES_BY_AUTHOR_SLUG[slug]) {
    return MOCK_ARTICLES_BY_AUTHOR_SLUG[slug];
  }

  const author = resolveMockPublicAuthor(slug);
  return buildAuthorArticles(author.name, slug, 8);
}
