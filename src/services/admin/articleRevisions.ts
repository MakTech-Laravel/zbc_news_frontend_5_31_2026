import { request } from "@/api/request";
import { resolvePagination } from "@/services/admin/activityLogShared";

export type ArticleRevisionListItem = {
  id: number;
  version: number;
  event: string;
  title: string | null;
  slug: string | null;
  status: string | null;
  changedFields: string[];
  createdBy: string;
  createdAt: string | null;
};

export type RevisionChangeKind = "added" | "removed" | "modified";

export type RevisionDiffSegment = {
  op: "equal" | "insert" | "delete";
  text: string;
};

export type ArticleRevisionChanges = {
  old: Record<string, unknown>;
  new: Record<string, unknown>;
  kinds: Record<string, RevisionChangeKind>;
  diffs: Record<string, RevisionDiffSegment[]>;
};

export type ArticleRevisionDetail = ArticleRevisionListItem & {
  snapshot: Record<string, unknown>;
  changes: ArticleRevisionChanges | null;
};

export type ArticleRevisionCompareSide = {
  id: number | null;
  version: number | null;
  label: string;
  createdAt?: string | null;
  createdBy?: string | null;
  snapshot: Record<string, unknown>;
};

export type ArticleRevisionComparison = {
  left: ArticleRevisionCompareSide;
  right: ArticleRevisionCompareSide;
  changes: ArticleRevisionChanges;
};

export type ArticleRevisionsResult = {
  revisions: ArticleRevisionListItem[];
  articleTitle: string;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapChangeKind(value: unknown): RevisionChangeKind {
  if (value === "added" || value === "removed" || value === "modified") {
    return value;
  }
  return "modified";
}

function mapDiffSegments(value: unknown): RevisionDiffSegment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const op = row.op;
      const text = row.text;
      if (
        (op === "equal" || op === "insert" || op === "delete") &&
        typeof text === "string"
      ) {
        return { op, text };
      }
      return null;
    })
    .filter((entry): entry is RevisionDiffSegment => entry !== null);
}

function mapChanges(raw: unknown): ArticleRevisionChanges {
  const changes = asRecord(raw);
  const kindsRaw = asRecord(changes.kinds);
  const diffsRaw = asRecord(changes.diffs);

  const kinds: Record<string, RevisionChangeKind> = {};
  for (const [key, value] of Object.entries(kindsRaw)) {
    kinds[key] = mapChangeKind(value);
  }

  const diffs: Record<string, RevisionDiffSegment[]> = {};
  for (const [key, value] of Object.entries(diffsRaw)) {
    diffs[key] = mapDiffSegments(value);
  }

  return {
    old: asRecord(changes.old),
    new: asRecord(changes.new),
    kinds,
    diffs,
  };
}

function mapListItem(raw: unknown): ArticleRevisionListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id)) return null;

  const changedFields = Array.isArray(row.changed_fields)
    ? row.changed_fields.filter((field): field is string => typeof field === "string")
    : [];

  return {
    id,
    version: Number(row.version) || 0,
    event: typeof row.event === "string" ? row.event : "edited",
    title: typeof row.title === "string" ? row.title : null,
    slug: typeof row.slug === "string" ? row.slug : null,
    status: typeof row.status === "string" ? row.status : null,
    changedFields,
    createdBy: typeof row.created_by === "string" ? row.created_by : "System",
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
  };
}

function mapCompareSide(raw: unknown): ArticleRevisionCompareSide {
  const row = asRecord(raw);
  return {
    id: row.id == null ? null : Number(row.id),
    version: row.version == null ? null : Number(row.version),
    label: typeof row.label === "string" ? row.label : "Version",
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    createdBy: typeof row.created_by === "string" ? row.created_by : null,
    snapshot: asRecord(row.snapshot),
  };
}

function extractRows(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];
  const root = body as Record<string, unknown>;
  const payload = root.data ?? root;
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const rows = record.data ?? record.revisions ?? record.items;
    if (Array.isArray(rows)) return rows;
  }
  return [];
}

function resolveArticleTitle(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const root = body as Record<string, unknown>;
  if (typeof root.article_title === "string" && root.article_title.trim()) {
    return root.article_title;
  }
  return fallback;
}

export async function fetchArticleRevisions(
  slug: string,
  page = 1,
): Promise<ArticleRevisionsResult> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/admin/articles/${encodedSlug}/revisions`, {
    params: { page },
  });

  const body = response.data;
  const revisions = extractRows(body)
    .map(mapListItem)
    .filter((row): row is ArticleRevisionListItem => row !== null);

  const pagination = resolvePagination(body, page, revisions.length);

  return {
    revisions,
    articleTitle: resolveArticleTitle(body, slug),
    ...pagination,
  };
}

export async function fetchArticleRevision(
  slug: string,
  revisionId: number,
): Promise<ArticleRevisionDetail> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(
    `/admin/articles/${encodedSlug}/revisions/${revisionId}`,
  );
  const body = response.data;
  const payload =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as Record<string, unknown>).data
      : body;

  const base = mapListItem(payload);
  if (!base) throw new Error("Invalid revision payload");

  const row = asRecord(payload);

  return {
    ...base,
    snapshot: asRecord(row.snapshot),
    changes: row.changes == null ? null : mapChanges(row.changes),
  };
}

export async function compareArticleRevisions(
  slug: string,
  leftId: number | null,
  rightId: number | null,
): Promise<ArticleRevisionComparison> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/admin/articles/${encodedSlug}/revisions/compare`, {
    params: {
      ...(leftId != null ? { left: leftId } : {}),
      ...(rightId != null ? { right: rightId } : {}),
    },
  });

  const body = response.data;
  const payload =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as Record<string, unknown>).data
      : body;
  const row = asRecord(payload);

  return {
    left: mapCompareSide(row.left),
    right: mapCompareSide(row.right),
    changes: mapChanges(row.changes),
  };
}

export async function restoreArticleRevision(
  slug: string,
  revisionId: number,
): Promise<{ title: string | null }> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.post(
    `/admin/articles/${encodedSlug}/revisions/${revisionId}/restore`,
  );
  const body = response.data;
  const payload =
    body && typeof body === "object" && "data" in (body as object)
      ? (body as Record<string, unknown>).data
      : body;
  const row = asRecord(payload);

  return {
    title: typeof row.title === "string" ? row.title : null,
  };
}
