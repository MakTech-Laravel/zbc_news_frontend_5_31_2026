import { request } from "@/api/request";

export type AdminSearchArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  author?: string;
  updated_at?: string;
};

export type AdminSearchUser = {
  id: string;
  name: string;
  email: string;
  updated_at?: string;
};

export type AdminSearchCategory = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

export type AdminSearchMedia = {
  id: string;
  uuid: string;
  name: string;
  mime_type?: string;
  updated_at?: string;
};

export type AdminSearchComment = {
  id: string;
  body: string;
  author: string;
  status: string;
  article_title?: string;
  article_slug?: string;
};

export type AdminSearchResults = {
  articles: AdminSearchArticle[];
  users: AdminSearchUser[];
  categories: AdminSearchCategory[];
  media: AdminSearchMedia[];
  comments: AdminSearchComment[];
  total: number;
};

export async function searchAdminPanel(query: string, limit = 5): Promise<AdminSearchResults> {
  const response = await request.get("/admin/search", {
    params: { q: query, limit },
  });

  const root = response.data as Record<string, unknown>;
  const data = (root.data ?? {}) as Record<string, unknown>;

  return {
    articles: Array.isArray(data.articles) ? (data.articles as AdminSearchArticle[]) : [],
    users: Array.isArray(data.users) ? (data.users as AdminSearchUser[]) : [],
    categories: Array.isArray(data.categories) ? (data.categories as AdminSearchCategory[]) : [],
    media: Array.isArray(data.media) ? (data.media as AdminSearchMedia[]) : [],
    comments: Array.isArray(data.comments) ? (data.comments as AdminSearchComment[]) : [],
    total: typeof root.total === "number" ? root.total : 0,
  };
}
