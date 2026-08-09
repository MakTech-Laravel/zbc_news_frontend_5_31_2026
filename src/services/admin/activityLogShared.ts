import type { ActivityLogRowBase } from "@/components/admin/shared/ActivityLogTable";

/** An image/document referenced by an activity, previewable instead of a raw path. */
export type ActivityFileValue = {
  kind: "image" | "video" | "audio" | "file";
  name: string;
  url: string | null;
  downloadUrl: string | null;
};

export type ActivityFieldValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | ActivityFileValue
  | ActivityFileValue[];

export function isActivityFileValue(value: unknown): value is ActivityFileValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record.kind === "string" && typeof record.name === "string";
}

export type BaseActivity = ActivityLogRowBase & {
  event: string | null;
  oldValues: Record<string, ActivityFieldValue> | null;
  newValues: Record<string, ActivityFieldValue> | null;
  tags: string[];
  ipAddress: string;
  userAgent: string | null;
};

export type ActivitiesPagination = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

function formatActivityDate(value: unknown): { label: string; iso: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { label: "—", iso: "" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { label: value, iso: value };
  }

  return {
    label: date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    iso: date.toISOString(),
  };
}

function formatActionLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const KNOWN_ACTIVITY_ACTIONS: Record<string, string> = {
  created: "Created",
  edited: "Edited",
  submitted_for_review: "Submitted For Review",
  approved: "Approved",
  rejected: "Rejected",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
  restored: "Restored",
  deleted: "Deleted",
  permanently_deleted: "Permanently Deleted",
  auto_saved: "Auto Saved",
};

function deriveAction(description: string, event: unknown): string {
  if (typeof event === "string" && event.trim()) {
    const key = event.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (KNOWN_ACTIVITY_ACTIONS[key]) return KNOWN_ACTIVITY_ACTIONS[key];
    return formatActionLabel(event);
  }

  const lower = description.toLowerCase();
  if (lower.includes("permanently deleted") || lower.includes("permanently_deleted")) {
    return "Permanently Deleted";
  }
  if (lower.includes("submitted for review") || lower.includes("submitted_for_review")) {
    return "Submitted For Review";
  }
  if (lower.includes("auto saved") || lower.includes("auto_saved") || lower.includes("autosaved")) {
    return "Auto Saved";
  }
  if (lower.includes("created")) return "Created";
  if (lower.includes("edited") || lower.includes("updated")) return "Edited";
  if (lower.includes("approved")) return "Approved";
  if (lower.includes("rejected")) return "Rejected";
  if (lower.includes("published")) return "Published";
  if (lower.includes("scheduled")) return "Scheduled";
  if (lower.includes("archived")) return "Archived";
  if (lower.includes("restored")) return "Restored";
  if (lower.includes("deleted")) return "Deleted";

  return description ? formatActionLabel(description) : "Activity";
}

function resolvePerformedBy(raw: Record<string, unknown>): string {
  if (typeof raw.causer === "string" && raw.causer.trim()) return raw.causer;
  if (typeof raw.performed_by === "string") return raw.performed_by;
  if (typeof raw.performedBy === "string") return raw.performedBy;
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  if (raw.causer && typeof raw.causer === "object") {
    const causer = raw.causer as Record<string, unknown>;
    if (typeof causer.name === "string") return causer.name;
  }
  return "System";
}

function isCategoryFieldKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    normalized === "category" ||
    normalized === "category_id" ||
    normalized === "categoryid" ||
    normalized.endsWith("_category_id")
  );
}

function toActivityFileValue(value: unknown): ActivityFileValue | null {
  if (!isActivityFileValue(value)) return null;

  const record = value as unknown as Record<string, unknown>;
  const kind = record.kind;
  const readUrl = (raw: unknown) =>
    typeof raw === "string" && raw.trim() ? raw : null;

  return {
    kind:
      kind === "image" || kind === "video" || kind === "audio" || kind === "file"
        ? kind
        : "file",
    name: String(record.name),
    url: readUrl(record.url),
    downloadUrl: readUrl(record.download_url) ?? readUrl(record.downloadUrl),
  };
}

/** Lists are either plain labels (tags) or file references (attachments). */
function normalizeListValue(entries: unknown[]): string[] | ActivityFileValue[] {
  const files = entries
    .map(toActivityFileValue)
    .filter((entry): entry is ActivityFileValue => entry !== null);

  if (files.length === entries.length) return files;

  return entries
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (typeof entry === "number" || typeof entry === "boolean") return String(entry);
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const candidate = record.label ?? record.name ?? record.title ?? record.filename;
        if (typeof candidate === "string") return candidate;
      }
      return "";
    })
    .filter((entry): entry is string => entry.length > 0);
}

function normalizeActivityFieldValue(
  key: string,
  entryValue: unknown,
): ActivityFieldValue | undefined {
  if (entryValue === null) return null;

  if (
    typeof entryValue === "string" ||
    typeof entryValue === "number" ||
    typeof entryValue === "boolean"
  ) {
    return entryValue;
  }

  // Lists (tags, attachments) must survive so file/tag changes appear in the diff.
  if (Array.isArray(entryValue)) {
    return normalizeListValue(entryValue);
  }

  if (!entryValue || typeof entryValue !== "object") {
    return undefined;
  }

  const fileValue = toActivityFileValue(entryValue);
  if (fileValue) return fileValue;

  const record = entryValue as Record<string, unknown>;

  if (isCategoryFieldKey(key)) {
    if (typeof record.title === "string" && record.title.trim()) return record.title;
    if (typeof record.name === "string" && record.name.trim()) return record.name;
    if (record.id != null) return record.id as number;
  }

  return undefined;
}

function parseRecordObject(value: unknown): Record<string, ActivityFieldValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  const result: Record<string, ActivityFieldValue> = {};

  Object.entries(record).forEach(([key, entryValue]) => {
    const normalized = normalizeActivityFieldValue(key, entryValue);
    if (normalized !== undefined) {
      result[key] = normalized;
    }
  });

  return Object.keys(result).length > 0 ? result : null;
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag === "object") {
        const record = tag as Record<string, unknown>;
        if (typeof record.name === "string") return record.name;
        if (typeof record.title === "string") return record.title;
      }
      return "";
    })
    .filter(Boolean);
}

export function resolveArticleTitleFromRecord(
  record: Record<string, unknown>,
  fallback = "—",
): string {
  if (record.article && typeof record.article === "object") {
    const article = record.article as Record<string, unknown>;
    if (typeof article.title === "string" && article.title.trim()) return article.title;
    if (typeof article.name === "string" && article.name.trim()) return article.name;
  }

  if (typeof record.article_title === "string" && record.article_title.trim()) {
    return record.article_title;
  }

  if (typeof record.title === "string" && record.title.trim()) {
    return record.title;
  }

  const properties = parseRecordObject(record.properties);
  if (properties) {
    const title = properties.title ?? properties.article_title;
    if (typeof title === "string" && title.trim()) return title;
  }

  return fallback;
}

export function mapApiActivity(raw: unknown): BaseActivity | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = record.id ?? record.uuid;
  if (id == null) return null;

  const description =
    typeof record.description === "string" ? record.description : "—";

  const created = formatActivityDate(
    record.created_at ?? record.createdAt ?? record.performed_at ?? record.date,
  );

  const event =
    typeof record.event === "string" && record.event.trim() ? record.event : null;

  return {
    id: String(id),
    action: deriveAction(description, event),
    event,
    description,
    performedBy: resolvePerformedBy(record),
    oldValues: parseRecordObject(record.old ?? record.old_values),
    newValues: parseRecordObject(record.new ?? record.new_values),
    tags: parseTags(record.tags),
    ipAddress:
      typeof record.ip_address === "string"
        ? record.ip_address
        : typeof record.ipAddress === "string"
          ? record.ipAddress
          : "—",
    userAgent:
      typeof record.user_agent === "string" && record.user_agent.trim()
        ? record.user_agent
        : typeof record.userAgent === "string" && record.userAgent.trim()
          ? record.userAgent
          : null,
    createdAt: created.label,
    createdAtIso: created.iso,
  };
}

export function extractActivityRows(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];

  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;

  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows =
      record.data ?? record.activities ?? record.items ?? record.logs ?? record.activity_logs;

    if (Array.isArray(rows)) return rows;
  }

  return [];
}

export function resolvePagination(
  body: unknown,
  page: number,
  rowCount: number,
  pageSize = 15,
): ActivitiesPagination {
  const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const meta =
    (root.meta && typeof root.meta === "object" ? root.meta : null) ??
    (root.pagination && typeof root.pagination === "object" ? root.pagination : null);

  if (meta && typeof meta === "object") {
    const record = meta as Record<string, unknown>;
    const totalItems = Number(record.total ?? rowCount);
    const resolvedPageSize = Number(record.per_page ?? record.pageSize ?? pageSize);
    const totalPages = Math.max(
      1,
      Number(record.last_page ?? record.totalPages ?? Math.ceil(totalItems / resolvedPageSize)),
    );

    return {
      page: Number(record.current_page ?? page),
      totalPages,
      totalItems,
      pageSize: resolvedPageSize,
    };
  }

  return {
    page,
    totalPages: 1,
    totalItems: rowCount,
    pageSize: Math.max(rowCount, pageSize),
  };
}

export function sortActivitiesDesc<T extends { createdAtIso: string }>(
  activities: T[],
): T[] {
  return [...activities].sort((a, b) => {
    const aTime = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
    const bTime = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
    return bTime - aTime;
  });
}
