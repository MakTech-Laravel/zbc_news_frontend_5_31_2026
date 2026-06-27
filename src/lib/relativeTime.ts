import { formatPublishDate, parsePublishDate } from "@/lib/publishDate";

const JUST_NOW_THRESHOLD_SEC = 45;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;

export function formatRelativeTime(value: unknown, now: Date = new Date()): string {
  const date = parsePublishDate(value);
  if (!date) return "";

  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < JUST_NOW_THRESHOLD_SEC) return "Just now";

  const diffMin = Math.floor(diffSec / SECONDS_PER_MINUTE);
  if (diffMin < 60) {
    return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
  }

  const diffHr = Math.floor(diffSec / SECONDS_PER_HOUR);
  if (diffHr < 24) {
    return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
  }

  const diffDay = Math.floor(diffSec / SECONDS_PER_DAY);
  if (diffDay < 7) {
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  }

  const parts = formatPublishDate(date);
  return parts.combined || parts.date;
}

export function getRelativeTimeUpdateInterval(
  value: unknown,
  now: Date = new Date(),
): number | null {
  const date = parsePublishDate(value);
  if (!date) return null;

  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < SECONDS_PER_HOUR) return 30_000;
  if (diffSec < SECONDS_PER_DAY) return 60_000;
  if (diffSec < SECONDS_PER_WEEK) return 300_000;
  return null;
}

export function getArticleFreshnessIso(article: {
  publishedAtIso?: string;
  updatedAtIso?: string;
}): string | undefined {
  const { publishedAtIso, updatedAtIso } = article;
  if (!publishedAtIso && !updatedAtIso) return undefined;
  if (!publishedAtIso) return updatedAtIso;
  if (!updatedAtIso) return publishedAtIso;

  const publishedTime = new Date(publishedAtIso).getTime();
  const updatedTime = new Date(updatedAtIso).getTime();
  if (Number.isNaN(publishedTime)) return updatedAtIso;
  if (Number.isNaN(updatedTime)) return publishedAtIso;

  return updatedTime > publishedTime ? updatedAtIso : publishedAtIso;
}
