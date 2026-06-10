import { request } from "@/api/request";
import {
  extractActivityRows,
  mapApiActivity,
  resolvePagination,
  sortActivitiesDesc,
  type BaseActivity,
} from "@/services/admin/activityLogShared";

export type { ActivityFieldValue } from "@/services/admin/activityLogShared";

export type ArticleActivity = BaseActivity;

export type ArticleActivitiesResult = {
  activities: ArticleActivity[];
  articleTitle: string;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

function resolveArticleTitle(body: unknown, fallbackSlug: string): string {
  if (!body || typeof body !== "object") return fallbackSlug;

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;

    if (record.article && typeof record.article === "object") {
      const article = record.article as Record<string, unknown>;
      if (typeof article.title === "string") return article.title;
    }

    if (typeof record.article_title === "string") return record.article_title;
    if (typeof record.title === "string" && !Array.isArray(record.data)) {
      return record.title;
    }
  }

  return fallbackSlug;
}

export async function fetchArticleActivities(
  slug: string,
  page = 1,
): Promise<ArticleActivitiesResult> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/admin/articles/${encodedSlug}/activities`, {
    params: { page },
  });

  const body = response.data;
  const activities = sortActivitiesDesc(
    extractActivityRows(body)
      .map(mapApiActivity)
      .filter((activity): activity is ArticleActivity => activity !== null),
  );

  const pagination = resolvePagination(body, page, activities.length);

  return {
    activities,
    articleTitle: resolveArticleTitle(body, slug),
    ...pagination,
  };
}
