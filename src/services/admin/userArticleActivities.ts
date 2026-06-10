import { request } from "@/api/request";
import {
  extractActivityRows,
  mapApiActivity,
  resolveArticleTitleFromRecord,
  resolvePagination,
  sortActivitiesDesc,
  type BaseActivity,
} from "@/services/admin/activityLogShared";

export type UserArticleActivity = BaseActivity & {
  articleTitle: string;
  articleSlug: string | null;
};

export type UserArticleActivitiesResult = {
  activities: UserArticleActivity[];
  userName: string;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

function resolveArticleSlug(record: Record<string, unknown>): string | null {
  if (record.article && typeof record.article === "object") {
    const article = record.article as Record<string, unknown>;
    if (typeof article.slug === "string" && article.slug.trim()) return article.slug;
  }

  if (typeof record.article_slug === "string" && record.article_slug.trim()) {
    return record.article_slug;
  }

  const properties = record.properties;
  if (properties && typeof properties === "object" && !Array.isArray(properties)) {
    const slug = (properties as Record<string, unknown>).slug;
    if (typeof slug === "string" && slug.trim()) return slug;
  }

  return null;
}

function mapUserArticleActivity(raw: unknown): UserArticleActivity | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const base = mapApiActivity(record);
  if (!base) return null;

  return {
    ...base,
    articleTitle: resolveArticleTitleFromRecord(record),
    articleSlug: resolveArticleSlug(record),
  };
}

function resolveUserName(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;

    if (record.user && typeof record.user === "object") {
      const user = record.user as Record<string, unknown>;
      if (typeof user.name === "string" && user.name.trim()) return user.name;
    }

    if (typeof record.user_name === "string" && record.user_name.trim()) {
      return record.user_name;
    }
  }

  return fallback;
}

export async function fetchUserArticleActivities(
  userId: string | number,
  page = 1,
): Promise<UserArticleActivitiesResult> {
  const response = await request.get(`/admin/users/${userId}/article-activities`, {
    params: { page },
  });

  const body = response.data;
  const activities = sortActivitiesDesc(
    extractActivityRows(body)
      .map(mapUserArticleActivity)
      .filter((activity): activity is UserArticleActivity => activity !== null),
  );

  const pagination = resolvePagination(body, page, activities.length);

  return {
    activities,
    userName: resolveUserName(body, `User #${userId}`),
    ...pagination,
  };
}
