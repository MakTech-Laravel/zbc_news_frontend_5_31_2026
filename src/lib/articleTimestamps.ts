import { parsePublishDate } from "@/lib/publishDate";

export type ArticleTimestampParts = {
  iso: string;
  label: string;
};

export type ResolvedArticleTimestamps = {
  published: ArticleTimestampParts;
  updated: ArticleTimestampParts;
  wasUpdated: boolean;
  relativeTimeIso: string;
};

const UPDATE_THRESHOLD_MS = 60_000;

/** e.g. "June 18, 2026 • 8:00 AM" */
export function formatArticleTimestamp(value: unknown): ArticleTimestampParts {
  const date = parsePublishDate(value);
  if (!date) {
    return { iso: "", label: "" };
  }

  const dateLabel = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    iso: date.toISOString(),
    label: `${dateLabel} • ${timeLabel}`,
  };
}

export function articleWasUpdated(
  publishedAtIso?: string | null,
  updatedAtIso?: string | null,
): boolean {
  if (!publishedAtIso || !updatedAtIso) return false;

  const published = parsePublishDate(publishedAtIso);
  const updated = parsePublishDate(updatedAtIso);
  if (!published || !updated) return false;

  return updated.getTime() > published.getTime() + UPDATE_THRESHOLD_MS;
}

/** ISO used for relative labels — updated_at when the article was edited, otherwise publish time. */
export function getArticleRelativeTimeIso(
  publishedAtIso?: string | null,
  updatedAtIso?: string | null,
): string | undefined {
  if (articleWasUpdated(publishedAtIso, updatedAtIso)) {
    return updatedAtIso ?? undefined;
  }

  return publishedAtIso ?? updatedAtIso ?? undefined;
}

export function resolveArticleTimestamps(
  publishedRaw: unknown,
  updatedRaw: unknown,
): ResolvedArticleTimestamps {
  const published = formatArticleTimestamp(publishedRaw);
  const updated = formatArticleTimestamp(updatedRaw);
  const wasUpdated = articleWasUpdated(published.iso, updated.iso);

  return {
    published,
    updated,
    wasUpdated,
    relativeTimeIso: getArticleRelativeTimeIso(published.iso, updated.iso) ?? "",
  };
}

export function mapArticleTimestampFields(record: {
  published_at?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
}) {
  const resolved = resolveArticleTimestamps(
    record.published_at ?? record.created_at,
    record.updated_at,
  );

  return {
    publishedAt: resolved.published.label,
    publishedAtIso: resolved.published.iso || undefined,
    updatedAtIso: resolved.updated.iso || undefined,
    showUpdated: resolved.wasUpdated,
  };
}
