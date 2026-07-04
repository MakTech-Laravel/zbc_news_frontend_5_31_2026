import axios from "axios";

import { request } from "@/api/request";
import type { Article } from "@/data/dummy/types";
import { mapArticleListItem } from "@/services/frontend/articles";
import type { AuthorProfileResult, AuthorSocialLinks, PublicAuthor } from "@/types/author";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const DEFAULT_PER_PAGE = 6;

export class AuthorProfileNotFoundError extends Error {
  constructor(slug: string) {
    super(`Author not found: ${slug}`);
    this.name = "AuthorProfileNotFoundError";
  }
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

function mapSocialLinks(raw: unknown): AuthorSocialLinks | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const record = raw as Record<string, unknown>;
  const links: AuthorSocialLinks = {};

  (["twitter", "facebook", "linkedin", "instagram", "youtube", "website"] as const).forEach(
    (key) => {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        links[key] = value.trim();
      }
    },
  );

  return Object.keys(links).length > 0 ? links : undefined;
}

function mapApiAuthor(raw: unknown): PublicAuthor | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = record.id;
  const name = record.name;
  const slug = record.slug;

  if (id == null || typeof name !== "string" || typeof slug !== "string") {
    return null;
  }

  return {
    id: String(id),
    slug,
    name,
    initials: toInitials(name),
    profileImageUrl: resolveMediaUrl(
      typeof record.profile_image === "string" ? record.profile_image : "",
    ),
    bio: typeof record.bio === "string" ? record.bio : undefined,
    publicTitle:
      typeof record.public_title === "string" ? record.public_title : undefined,
    socialLinks: mapSocialLinks(record.social_links),
    publishedArticlesCount:
      typeof record.published_articles_count === "number"
        ? record.published_articles_count
        : Number(record.published_articles_count ?? 0),
  };
}

export async function fetchAuthorBySlug(
  slug: string,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): Promise<AuthorProfileResult> {
  try {
    const response = await request.get(`/authors/${encodeURIComponent(slug)}`, {
      params: {
        page,
        per_page: perPage,
      },
    });

    const payload = response.data?.data;
    const author = mapApiAuthor(payload?.author);
    if (!author) {
      throw new Error("Invalid author profile response.");
    }

    const articles = Array.isArray(payload?.articles)
      ? payload.articles
          .map((item: unknown) => mapArticleListItem(item))
          .filter((item: Article | null): item is Article => item !== null)
      : [];

    const meta = payload?.meta ?? {};

    return {
      author,
      articles,
      meta: {
        current_page: Number(meta.current_page ?? page),
        last_page: Number(meta.last_page ?? 1),
        per_page: Number(meta.per_page ?? perPage),
        total: Number(meta.total ?? articles.length),
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new AuthorProfileNotFoundError(slug);
    }
    throw error;
  }
}
