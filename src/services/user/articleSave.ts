import { api } from "@/api/client";

export type ArticleSaveStatus = {
  saved: boolean;
};

function normalizeArticleId(articleId: string | number): number {
  const id = Number(articleId);
  if (!id || Number.isNaN(id)) {
    throw new Error("Invalid article id");
  }
  return id;
}

export async function checkArticleSaved(
  articleId: string | number,
): Promise<ArticleSaveStatus> {
  const id = normalizeArticleId(articleId);
  const response = await api.get(`/admin/save-articles/check/${id}`, {
    skipAuthRedirect: true,
  });
  return {
    saved: Boolean(response.data?.data?.saved),
  };
}

export async function toggleArticleSave(
  articleId: string | number,
): Promise<ArticleSaveStatus> {
  const id = normalizeArticleId(articleId);
  const response = await api.post("/admin/save-articles/toggle", {
    article_id: id,
  });
  return {
    saved: Boolean(response.data?.data?.saved),
  };
}
