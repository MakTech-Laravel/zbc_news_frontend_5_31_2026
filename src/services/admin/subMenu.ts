import { request } from "@/api/request";

export type SubMenuKey =
  | "trending"
  | "most_read"
  | "live_updates"
  | "editorial_picks";

export type MostReadPeriod = "today" | "week" | "month" | "all";

export type SubMenuSettings = {
  id?: number;
  section_key: SubMenuKey | string;
  limit: number;
  trending_window_hours: number;
  most_read_default_period: MostReadPeriod;
  pinned_slots: number;
  is_enabled: boolean;
  config: Record<string, unknown> | null;
};

export type SubMenuArticleSummary = {
  id: number;
  title: string;
  slug: string;
  status?: string;
  published_at?: string | null;
  is_live?: boolean;
  live_started_at?: string | null;
  live_ended_at?: string | null;
  serial?: number;
  category?: { id: number; title: string; slug: string } | null;
  user?: { id: number; name: string } | null;
};

export type SubMenuManualEntry = {
  id: number;
  section_key: string;
  article_id: number;
  sort_order: number;
  is_pinned: boolean;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  article?: SubMenuArticleSummary | null;
};

export type SubMenuSnapshot = {
  settings: SubMenuSettings;
  manual: SubMenuManualEntry[];
  algorithmic: SubMenuArticleSummary[];
  items: SubMenuArticleSummary[];
};

export type SubMenuSettingsPayload = {
  limit?: number;
  trending_window_hours?: number;
  most_read_default_period?: MostReadPeriod;
  pinned_slots?: number;
  is_enabled?: boolean;
  config?: Record<string, unknown> | null;
};

export type SubMenuManualPayload = {
  article_id: number;
  sort_order?: number;
  is_pinned?: boolean;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

function asArticleSummary(raw: unknown): SubMenuArticleSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  const title = typeof record.title === "string" ? record.title : "";
  const slug = typeof record.slug === "string" ? record.slug : "";
  if (!Number.isFinite(id) || !title) return null;
  return {
    id,
    title,
    slug,
    status: typeof record.status === "string" ? record.status : undefined,
    published_at: typeof record.published_at === "string" ? record.published_at : null,
    is_live: Boolean(record.is_live),
    live_started_at:
      typeof record.live_started_at === "string" ? record.live_started_at : null,
    live_ended_at: typeof record.live_ended_at === "string" ? record.live_ended_at : null,
    serial:
      Number.isFinite(Number(record.serial)) && Number(record.serial) > 0
        ? Math.trunc(Number(record.serial))
        : undefined,
    category:
      record.category && typeof record.category === "object"
        ? (record.category as SubMenuArticleSummary["category"])
        : null,
    user:
      record.user && typeof record.user === "object"
        ? (record.user as SubMenuArticleSummary["user"])
        : null,
  };
}

function mapManual(raw: unknown): SubMenuManualEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = Number(record.id);
  const articleId = Number(record.article_id);
  if (!Number.isFinite(id) || !Number.isFinite(articleId)) return null;
  return {
    id,
    section_key: typeof record.section_key === "string" ? record.section_key : "",
    article_id: articleId,
    sort_order: Number(record.sort_order ?? 0) || 0,
    is_pinned: Boolean(record.is_pinned),
    is_active: Boolean(record.is_active),
    starts_at: typeof record.starts_at === "string" ? record.starts_at : null,
    ends_at: typeof record.ends_at === "string" ? record.ends_at : null,
    article: asArticleSummary(record.article),
  };
}

function mapSnapshot(raw: unknown): SubMenuSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const settingsRaw =
    record.settings && typeof record.settings === "object"
      ? (record.settings as Record<string, unknown>)
      : {};

  const period = settingsRaw.most_read_default_period;
  const settings: SubMenuSettings = {
    id: Number(settingsRaw.id) || undefined,
    section_key: String(settingsRaw.section_key ?? ""),
    limit: Math.max(1, Number(settingsRaw.limit ?? 5) || 5),
    trending_window_hours: Math.max(1, Number(settingsRaw.trending_window_hours ?? 24) || 24),
    most_read_default_period:
      period === "week" || period === "month" || period === "all" || period === "today"
        ? period
        : "today",
    pinned_slots: Math.max(0, Number(settingsRaw.pinned_slots ?? 0) || 0),
    is_enabled: Boolean(settingsRaw.is_enabled ?? true),
    config:
      settingsRaw.config && typeof settingsRaw.config === "object"
        ? (settingsRaw.config as Record<string, unknown>)
        : null,
  };

  return {
    settings,
    manual: Array.isArray(record.manual)
      ? record.manual.map(mapManual).filter((row): row is SubMenuManualEntry => row !== null)
      : [],
    algorithmic: Array.isArray(record.algorithmic)
      ? record.algorithmic
          .map(asArticleSummary)
          .filter((row): row is SubMenuArticleSummary => row !== null)
      : [],
    items: Array.isArray(record.items)
      ? record.items
          .map(asArticleSummary)
          .filter((row): row is SubMenuArticleSummary => row !== null)
      : [],
  };
}

export async function fetchAdminSubMenus(
  section?: SubMenuKey,
): Promise<Partial<Record<SubMenuKey, SubMenuSnapshot>>> {
  const response = await request.get("/admin/sub-menu", {
    params: section ? { section } : undefined,
  });
  const data = response.data?.data;
  if (!data || typeof data !== "object") return {};

  const result: Partial<Record<SubMenuKey, SubMenuSnapshot>> = {};
  for (const key of Object.keys(data) as SubMenuKey[]) {
    const mapped = mapSnapshot((data as Record<string, unknown>)[key]);
    if (mapped) result[key] = mapped;
  }
  return result;
}

export async function updateSubMenuSettings(
  section: SubMenuKey,
  payload: SubMenuSettingsPayload,
): Promise<SubMenuSettings> {
  const response = await request.post(`/admin/sub-menu/settings/${section}`, payload);
  const raw = response.data?.data as Record<string, unknown> | undefined;
  const mapped = mapSnapshot({ settings: raw });
  return (
    mapped?.settings ?? {
      section_key: section,
      limit: 5,
      trending_window_hours: 24,
      most_read_default_period: "today",
      pinned_slots: 0,
      is_enabled: true,
      config: null,
    }
  );
}

export async function upsertSubMenuManualEntry(
  section: SubMenuKey,
  payload: SubMenuManualPayload,
): Promise<SubMenuManualEntry> {
  const response = await request.post(`/admin/sub-menu/manual/${section}`, payload);
  const mapped = mapManual(response.data?.data);
  if (!mapped) throw new Error("Failed to save sub menu manual entry");
  return mapped;
}

export async function reorderSubMenuManualEntries(
  section: SubMenuKey,
  ids: number[],
): Promise<SubMenuManualEntry[]> {
  const response = await request.post(`/admin/sub-menu/manual/${section}/reorder`, {
    ids,
  });
  const rows = response.data?.data;
  if (!Array.isArray(rows)) return [];
  return rows.map(mapManual).filter((row): row is SubMenuManualEntry => row !== null);
}

export async function removeSubMenuManualEntry(id: number): Promise<void> {
  await request.delete(`/admin/sub-menu/manual/${id}`);
}
