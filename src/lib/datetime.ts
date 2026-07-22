/** True when the string already carries an explicit timezone (Z or ±HH:MM). */
function hasExplicitTimezone(value: string): boolean {
  return /([zZ]|[+-]\d{2}:?\d{2})$/.test(value.trim());
}

/**
 * Parse an API / ISO datetime into a Date instant.
 * Naive values (no Z/offset) are treated as UTC, matching backend storage.
 */
function parseApiDatetime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (hasExplicitTimezone(trimmed)) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const naiveMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2}))?(?:\.\d+)?$/,
  );
  if (naiveMatch) {
    const seconds = naiveMatch[3] ?? "00";
    const date = new Date(`${naiveMatch[1]}T${naiveMatch[2]}:${seconds}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a Date instant as `datetime-local` value in the browser's local timezone. */
function formatDatetimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Convert API / ISO datetime strings to `datetime-local` input value (YYYY-MM-DDTHH:mm). */
export function toDatetimeLocalValue(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";

  const date = parseApiDatetime(value);
  if (!date) return "";

  return formatDatetimeLocal(date);
}

/**
 * Convert `datetime-local` input value to UTC ISO for the API.
 * Browser interprets bare `YYYY-MM-DDTHH:mm` as local wall-clock time.
 */
export function toApiDatetimeValue(value: string): string {
  if (!value.trim()) return "";

  const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?$/);
  if (localMatch) {
    const withSeconds = localMatch[3] ? value : `${value}:00`;
    const date = new Date(withSeconds);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  }

  // Already an absolute instant (ISO with Z/offset) — normalize to UTC ISO.
  if (hasExplicitTimezone(value)) {
    const date = new Date(value.trim());
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  }

  // Legacy naive `Y-m-d H:i:s` — treat as UTC.
  const parsed = parseApiDatetime(value);
  if (!parsed) return value;
  return parsed.toISOString();
}

export function isFutureDatetimeLocal(value: string, now = new Date()): boolean {
  if (!value.trim()) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() > now.getTime();
}
