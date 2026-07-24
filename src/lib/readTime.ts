/** Estimate reading time from HTML or plain text (200 wpm). */
export function estimateReadTime(content: string | null | undefined): string {
  if (!content?.trim()) {
    return "1 min read";
  }

  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "1 min read";
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return `${minutes} min read`;
}

/**
 * Public display estimate: ≤250 words → 1 min read,
 * otherwise ceil(words / 250).
 */
export function estimateReadTimeByWordCount(
  content: string | null | undefined,
): string {
  if (!content?.trim()) {
    return "1 min read";
  }

  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "1 min read";
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 250));

  return `${minutes} min read`;
}

/** Prefer API read_time; otherwise compute from article body fields. */
export function resolveReadTime(
  readTime: unknown,
  ...contentSources: Array<string | null | undefined>
): string {
  if (typeof readTime === "string" && readTime.trim()) {
    return readTime.trim();
  }

  for (const source of contentSources) {
    if (source?.trim()) {
      return estimateReadTime(source);
    }
  }

  return "1 min read";
}

/** Prefer API estimated_read_time; otherwise compute with 250 wpm. */
export function resolveEstimatedReadTime(
  estimatedReadTime: unknown,
  ...contentSources: Array<string | null | undefined>
): string {
  if (typeof estimatedReadTime === "string" && estimatedReadTime.trim()) {
    return estimatedReadTime.trim();
  }

  for (const source of contentSources) {
    if (source?.trim()) {
      return estimateReadTimeByWordCount(source);
    }
  }

  return "1 min read";
}
