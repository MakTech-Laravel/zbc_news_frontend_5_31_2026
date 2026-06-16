import { request } from "@/api/request";

export type QuickLink = {
  id: number;
  label: string;
  url: string;
  icon?: string | null;
  sort_order?: number;
};

export async function fetchQuickLinks(): Promise<QuickLink[]> {
  const response = await request.get("/navigation/quick-links");
  const payload = response.data?.data;
  if (!Array.isArray(payload)) return [];
  return payload as QuickLink[];
}

