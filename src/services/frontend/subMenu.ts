import { request } from "@/api/request";
import type { Article } from "@/data/dummy/types";
import { mapArticleListItem } from "@/services/frontend/articles";
import type { MostReadPeriod } from "@/services/frontend/articles";

export type SubMenuKey =
  | "trending"
  | "most_read"
  | "live_updates"
  | "editorial_picks";

export type SubMenuSettings = {
  limit: number;
  trending_window_hours: number;
  most_read_default_period: MostReadPeriod;
  pinned_slots: number;
  is_enabled: boolean;
  config: Record<string, unknown> | null;
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
  article: Article | null;
};

export type SubMenuPayload = {
  section: SubMenuKey;
  settings: SubMenuSettings;
  manual: SubMenuManualEntry[];
  algorithmic: Article[];
  items: Article[];
};

function asPeriod(value: unknown): MostReadPeriod {
  if (value === "week" || value === "month" || value === "all" || value === "today") {
    return value;
  }
  return "today";
}

function mapSettings(raw: unknown): SubMenuSettings {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    limit: Math.max(1, Number(record.limit ?? 5) || 5),
    trending_window_hours: Math.max(1, Number(record.trending_window_hours ?? 24) || 24),
    most_read_default_period: asPeriod(record.most_read_default_period),
    pinned_slots: Math.max(0, Number(record.pinned_slots ?? 0) || 0),
    is_enabled: Boolean(record.is_enabled ?? true),
    config:
      record.config && typeof record.config === "object"
        ? (record.config as Record<string, unknown>)
        : null,
  };
}

function mapManualEntry(raw: unknown): SubMenuManualEntry | null {
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
    article: mapArticleListItem(record.article),
  };
}

function mapSectionPayload(raw: unknown, fallbackKey: SubMenuKey): SubMenuPayload {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const section =
    typeof record.section === "string" && record.section
      ? (record.section as SubMenuKey)
      : fallbackKey;

  // Preserve API array order exactly — never re-sort on the client.
  const items = Array.isArray(record.items)
    ? record.items
        .map(mapArticleListItem)
        .filter((article): article is Article => article !== null)
        .map((article, index) => ({
          ...article,
          serial: article.serial ?? index + 1,
        }))
    : [];

  const algorithmic = Array.isArray(record.algorithmic)
    ? record.algorithmic
        .map(mapArticleListItem)
        .filter((article): article is Article => article !== null)
    : [];

  const manual = Array.isArray(record.manual)
    ? record.manual
        .map(mapManualEntry)
        .filter((entry): entry is SubMenuManualEntry => entry !== null)
    : [];

  return {
    section,
    settings: mapSettings(record.settings),
    manual,
    algorithmic,
    items,
  };
}

export async function fetchSubMenuSection(
  section: SubMenuKey,
): Promise<SubMenuPayload> {
  const response = await request.get(`/sub-menu/${section}`);
  return mapSectionPayload(response.data?.data, section);
}

export async function fetchAllSubMenus(): Promise<
  Partial<Record<SubMenuKey, SubMenuPayload>>
> {
  const response = await request.get("/sub-menu");
  const data = response.data?.data;
  if (!data || typeof data !== "object") return {};

  const result: Partial<Record<SubMenuKey, SubMenuPayload>> = {};
  for (const key of Object.keys(data) as SubMenuKey[]) {
    result[key] = mapSectionPayload(
      (data as Record<string, unknown>)[key],
      key,
    );
  }
  return result;
}
