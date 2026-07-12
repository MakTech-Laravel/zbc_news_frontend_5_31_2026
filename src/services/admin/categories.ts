import { request } from "@/api/request";

export type AdminCategoryStatus = "active" | "inactive";

export type AdminCategory = {
  id: number | string;
  title: string;
  slug: string;
  status: AdminCategoryStatus;
  sort_order: number;
  is_featured?: boolean;
  parent_id?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryPayload = {
  title: string;
  slug: string;
  status: AdminCategoryStatus;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  parent_id?: number | null;
  sort_order?: number;
};

function unwrapList(response: { data?: { data?: unknown } }): AdminCategory[] {
  const rows = response.data?.data;
  return Array.isArray(rows) ? (rows as AdminCategory[]) : [];
}

export async function fetchCategories(): Promise<AdminCategory[]> {
  const response = await request.get("/categories");
  return unwrapList(response);
}

export async function createCategory(payload: CategoryPayload): Promise<AdminCategory> {
  const response = await request.post("/admin/categories/store", payload);
  return response.data.data as AdminCategory;
}

export async function updateCategory(
  slug: string,
  payload: CategoryPayload,
): Promise<AdminCategory> {
  const response = await request.post(`/admin/categories/update/${slug}`, payload);
  return response.data.data as AdminCategory;
}

export async function deleteCategory(slug: string): Promise<void> {
  await request.delete(`/admin/categories/delete/${slug}`);
}

export async function reorderCategories(ids: Array<number | string>): Promise<AdminCategory[]> {
  const response = await request.post("/admin/categories/reorder", {
    ids: ids.map((id) => Number(id)),
  });
  return unwrapList(response);
}

export async function moveCategory(
  slug: string,
  position: number,
): Promise<AdminCategory[]> {
  const response = await request.post(`/admin/categories/move/${slug}`, { position });
  return unwrapList(response);
}
