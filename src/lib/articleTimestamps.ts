import { parsePublishDate } from "@/lib/publishDate";

export const DEFAULT_SITE_TIMEZONE = "America/New_York";

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

/** e.g. "July 30, 2026 at 9:00 AM" in the site timezone */
export function formatArticleTimestamp(
  value: unknown,
  timeZone: string = DEFAULT_SITE_TIMEZONE,
): ArticleTimestampParts {
  const date = parsePublishDate(value);
  if (!date) {
    return { iso: "", label: "" };
  }

  const tz = timeZone.trim() || DEFAULT_SITE_TIMEZONE;

  const dateLabel = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: tz,
  });

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });

  return {
    iso: date.toISOString(),
    label: `${dateLabel} at ${timeLabel}`,
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

/**
 * True when Updated should be shown (create alone does not count).
 * Uses published_at when present, otherwise created_at as the baseline.
 */
export function articleShowsUpdatedTimestamp(
  updatedAtIso?: string | null,
  publishedAtIso?: string | null,
  createdAtIso?: string | null,
): boolean {
  const baseline = publishedAtIso || createdAtIso;
  return articleWasUpdated(baseline, updatedAtIso);
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
  timeZone: string = DEFAULT_SITE_TIMEZONE,
): ResolvedArticleTimestamps {
  const published = formatArticleTimestamp(publishedRaw, timeZone);
  const updated = formatArticleTimestamp(updatedRaw, timeZone);
  const wasUpdated = articleWasUpdated(published.iso, updated.iso);

  return {
    published,
    updated,
    wasUpdated,
    relativeTimeIso: getArticleRelativeTimeIso(published.iso, updated.iso) ?? "",
  };
}

export function mapArticleTimestampFields(
  record: {
    published_at?: unknown;
    created_at?: unknown;
    updated_at?: unknown;
  },
  timeZone: string = DEFAULT_SITE_TIMEZONE,
) {
  const resolved = resolveArticleTimestamps(
    record.published_at ?? record.created_at,
    record.updated_at,
    timeZone,
  );

  return {
    publishedAt: resolved.published.label,
    publishedAtIso: resolved.published.iso || undefined,
    updatedAtIso: resolved.updated.iso || undefined,
    showUpdated: resolved.wasUpdated,
  };
}
