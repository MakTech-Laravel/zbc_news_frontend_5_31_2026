import { request } from "@/api/request";

export type MenuStatus = "active" | "inactive";
export type MenuItemType = "custom" | "category" | string;
export type MenuItemTarget = "_self" | "_blank";
export type MenuRenderStyle = "standard" | "dropdown" | "mega" | "mobile" | "footer";

export type AdminMenuLocation = {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  render_style: MenuRenderStyle;
  menu_id?: number | null;
  is_active: boolean;
  sort_order: number;
  menu?: { id: number; name: string; slug: string; status: MenuStatus } | null;
};

export type AdminMenuItem = {
  id: number;
  menu_id: number;
  parent_id: number | null;
  type: MenuItemType;
  label: string;
  url?: string | null;
  target: MenuItemTarget;
  icon?: string | null;
  reference_type?: string | null;
  reference_id?: number | null;
  sort_order: number;
  is_active: boolean;
  meta?: Record<string, unknown> | null;
  category?: { id: number; title: string; slug: string } | null;
  children?: AdminMenuItem[];
};

export type AdminMenu = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  status: MenuStatus;
  items_count?: number;
  locations?: Array<{
    id: number;
    key: string;
    name: string;
    render_style: MenuRenderStyle;
  }>;
  items?: AdminMenuItem[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type MenuPayload = {
  name: string;
  slug?: string;
  description?: string;
  status?: MenuStatus;
  location_keys?: string[];
};

export type MenuItemPayload = {
  type: MenuItemType;
  label?: string;
  url?: string;
  target?: MenuItemTarget;
  icon?: string | null;
  reference_id?: number | null;
  category_id?: number | null;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
  include_children?: boolean;
  meta?: Record<string, unknown>;
};

export type MenuLocationPayload = {
  key?: string;
  name: string;
  description?: string;
  render_style?: MenuRenderStyle;
  menu_id?: number | null;
  is_active?: boolean;
  sort_order?: number;
};

export type MenuMetaOptions = {
  types: Array<{ value: string; label: string }>;
  render_styles: Array<{ value: string; label: string }>;
  targets: Array<{ value: string; label: string }>;
};

function unwrapList<T>(response: { data?: { data?: unknown } }): T[] {
  const rows = response.data?.data;
  return Array.isArray(rows) ? (rows as T[]) : [];
}

export async function fetchMenus(withTrashed = false): Promise<AdminMenu[]> {
  const response = await request.get("/admin/menus", {
    params: withTrashed ? { with_trashed: 1 } : undefined,
  });
  return unwrapList<AdminMenu>(response);
}

export async function fetchMenu(id: number): Promise<AdminMenu> {
  const response = await request.get(`/admin/menus/show/${id}`);
  return response.data.data as AdminMenu;
}

export async function fetchMenuTree(id: number): Promise<{
  menu: { id: number; name: string; slug: string };
  items: AdminMenuItem[];
}> {
  const response = await request.get(`/admin/menus/tree/${id}`);
  return response.data.data;
}

export async function createMenu(payload: MenuPayload): Promise<AdminMenu> {
  const response = await request.post("/admin/menus/store", payload);
  return response.data.data as AdminMenu;
}

export async function updateMenu(id: number, payload: MenuPayload): Promise<AdminMenu> {
  const response = await request.post(`/admin/menus/update/${id}`, payload);
  return response.data.data as AdminMenu;
}

export async function deleteMenu(id: number): Promise<void> {
  await request.delete(`/admin/menus/delete/${id}`);
}

export async function restoreMenu(id: number): Promise<AdminMenu> {
  const response = await request.post(`/admin/menus/restore/${id}`);
  return response.data.data as AdminMenu;
}

export async function forceDeleteMenu(id: number): Promise<void> {
  await request.delete(`/admin/menus/force/${id}`);
}

export async function createMenuItem(
  menuId: number,
  payload: MenuItemPayload,
): Promise<AdminMenuItem> {
  const response = await request.post(`/admin/menus/${menuId}/items/store`, payload);
  return response.data.data as AdminMenuItem;
}

export async function updateMenuItem(
  itemId: number,
  payload: Partial<MenuItemPayload>,
): Promise<AdminMenuItem> {
  const response = await request.post(`/admin/menus/items/update/${itemId}`, payload);
  return response.data.data as AdminMenuItem;
}

export async function deleteMenuItem(itemId: number): Promise<void> {
  await request.delete(`/admin/menus/items/delete/${itemId}`);
}

export async function reorderMenuItems(
  menuId: number,
  ids: number[],
  parentId: number | null = null,
): Promise<AdminMenuItem[]> {
  const response = await request.post(`/admin/menus/${menuId}/items/reorder`, {
    ids,
    parent_id: parentId,
  });
  return unwrapList<AdminMenuItem>(response);
}

export async function syncMenuTree(
  menuId: number,
  nodes: Array<{ id: number; parent_id: number | null; sort_order: number }>,
): Promise<AdminMenu> {
  const response = await request.post(`/admin/menus/${menuId}/items/sync-tree`, { nodes });
  return response.data.data as AdminMenu;
}

export async function fetchMenuLocations(): Promise<AdminMenuLocation[]> {
  const response = await request.get("/admin/menus/locations");
  return unwrapList<AdminMenuLocation>(response);
}

export async function createMenuLocation(
  payload: MenuLocationPayload,
): Promise<AdminMenuLocation> {
  const response = await request.post("/admin/menus/locations/store", payload);
  return response.data.data as AdminMenuLocation;
}

export async function updateMenuLocation(
  id: number,
  payload: Partial<MenuLocationPayload>,
): Promise<AdminMenuLocation> {
  const response = await request.post(`/admin/menus/locations/update/${id}`, payload);
  return response.data.data as AdminMenuLocation;
}

export async function deleteMenuLocation(id: number): Promise<void> {
  await request.delete(`/admin/menus/locations/delete/${id}`);
}

export async function fetchMenuMetaOptions(): Promise<MenuMetaOptions> {
  const response = await request.get("/admin/menus/item-types");
  return response.data.data as MenuMetaOptions;
}
