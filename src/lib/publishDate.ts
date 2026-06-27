export type PublishDateParts = {
  date: string;
  time: string;
  iso: string;
  /** Date and time combined for compact listings, e.g. "Jun 16, 2026 · 9:41 AM" */
  combined: string;
};

export function parsePublishDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string" || !value.trim()) return null;

  const date = new Date(value.includes(" ") ? value.replace(" ", "T") : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPublishDate(value: unknown): PublishDateParts {
  const date = parsePublishDate(value);
  if (!date) {
    return { date: "", time: "", iso: "", combined: "" };
  }

  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    date: dateLabel,
    time: timeLabel,
    iso: date.toISOString(),
    combined: `${dateLabel} · ${timeLabel}`,
  };
}

export function formatPublishDateTime(value: unknown): string {
  const parts = formatPublishDate(value);
  return parts.combined || "—";
}
