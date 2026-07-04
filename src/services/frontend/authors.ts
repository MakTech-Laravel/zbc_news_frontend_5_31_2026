import type { Article } from "@/data/dummy/types";
import {
  getMockAuthorArticles,
  resolveMockPublicAuthor,
} from "@/data/mock/publicAuthors";
import type { AuthorProfileResult } from "@/types/author";

const MOCK_REQUEST_DELAY_MS = 450;
const DEFAULT_PER_PAGE = 6;

function paginateArticles(articles: Article[], page: number, perPage: number) {
  const total = articles.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(page, 1), lastPage);
  const start = (currentPage - 1) * perPage;

  return {
    items: articles.slice(start, start + perPage),
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Fetches a public author profile with paginated published articles.
 *
 * TODO(backend): Replace mock implementation with:
 *   GET /api/v1/authors/{slug}?page={page}&per_page={perPage}
 */
export async function fetchAuthorBySlug(
  slug: string,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): Promise<AuthorProfileResult> {
  await delay(MOCK_REQUEST_DELAY_MS);

  if (slug === "demo-error") {
    throw new Error("Failed to load author profile.");
  }

  const author = resolveMockPublicAuthor(slug);
  const allArticles = getMockAuthorArticles(slug);
  const { items, meta } = paginateArticles(allArticles, page, perPage);

  return {
    author: {
      ...author,
      publishedArticlesCount: meta.total,
    },
    articles: items,
    meta,
  };
}
