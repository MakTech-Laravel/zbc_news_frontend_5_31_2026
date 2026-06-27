import type { Article } from "@/data/dummy/types";
import type { UserFeedArticle } from "@/data/dummy/userDashboard";
import { resolveReadTime } from "@/lib/readTime";
import {
  fetchArticlesByTag,
  fetchGridArticles,
  fetchMostReadArticles,
} from "@/services/frontend/articles";

const EDITORIAL_TAGS = ["opinion", "editorial", "analysis"];
const GUEST_TAGS = ["commentary", "guest", "guest-commentary"];

export type EditorialBoardMember = {
  id: string;
  name: string;
  title: string;
};

export type EditorialPick = {
  id: string;
  title: string;
  slug?: string;
};

export type EditorialPageData = {
  featured: UserFeedArticle | null;
  latestEditorials: UserFeedArticle[];
  guestCommentary: UserFeedArticle[];
  editorPicks: EditorialPick[];
  boardMembers: EditorialBoardMember[];
};

export function mapArticleToUserFeed(article: Article): UserFeedArticle {
  return {
    id: article.id,
    slug: article.slug,
    category: article.category || "Editorial",
    title: article.title,
    excerpt: article.excerpt || "No summary available.",
    author: article.author || "Editorial Team",
    readTime: resolveReadTime(article.readTime, article.excerpt),
    publishedAt: article.publishedAt || "Recently",
    publishedAtIso: article.publishedAtIso,
    updatedAtIso: article.updatedAtIso,
    views: article.views,
    imageUrl: article.imageUrl,
  };
}

async function loadTaggedArticles(tags: string[]): Promise<Article[]> {
  const batches = await Promise.all(
    tags.map((tag) => fetchArticlesByTag(tag).catch(() => [] as Article[])),
  );

  const merged = new Map<string, Article>();
  for (const batch of batches) {
    for (const article of batch) {
      merged.set(article.id, article);
    }
  }

  return Array.from(merged.values());
}

function buildBoardMembers(articles: UserFeedArticle[]): EditorialBoardMember[] {
  const members: EditorialBoardMember[] = [];
  const seenAuthors = new Set<string>();

  for (const article of articles) {
    const name = article.author?.trim();
    if (!name || seenAuthors.has(name.toLowerCase())) continue;

    seenAuthors.add(name.toLowerCase());
    members.push({
      id: `author-${members.length + 1}`,
      name,
      title: members.length === 0 ? "Editor-in-Chief" : "Contributor",
    });

    if (members.length >= 4) break;
  }

  return members;
}

export async function fetchEditorialPageData(): Promise<EditorialPageData> {
  let articles = await loadTaggedArticles(EDITORIAL_TAGS);

  if (articles.length === 0) {
    articles = await fetchGridArticles();
  }

  const mapped = articles.map(mapArticleToUserFeed);

  let guestArticles = (await loadTaggedArticles(GUEST_TAGS)).map(mapArticleToUserFeed);
  if (guestArticles.length === 0) {
    guestArticles = mapped.slice(6, 11);
  }

  let picks: UserFeedArticle[] = [];
  try {
    picks = (await fetchArticlesByTag("opinion", "recommended")).map(mapArticleToUserFeed);
  } catch {
    picks = [];
  }

  if (picks.length === 0) {
    try {
      picks = (await fetchMostReadArticles()).slice(0, 4).map(mapArticleToUserFeed);
    } catch {
      picks = mapped.slice(0, 4);
    }
  }

  return {
    featured: mapped[0] ?? null,
    latestEditorials: mapped.slice(1, 6),
    guestCommentary: guestArticles.slice(0, 5),
    editorPicks: picks.slice(0, 4).map((article, index) => ({
      id: article.id || String(index + 1),
      title: article.title,
      slug: article.slug,
    })),
    boardMembers: buildBoardMembers(mapped),
  };
}
