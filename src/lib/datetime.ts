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

/** Format a Date instant as `datetime-local` value in a specific IANA timezone. */
function formatDatetimeLocalInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Convert API / ISO datetime strings to `datetime-local` input value (YYYY-MM-DDTHH:mm). */
export function toDatetimeLocalValue(value: unknown, timeZone?: string): string {
  if (typeof value !== "string" || !value.trim()) return "";

  const date = parseApiDatetime(value);
  if (!date) return "";

  if (timeZone) {
    try {
      return formatDatetimeLocalInTimeZone(date, timeZone);
    } catch {
      // fall through to browser local
    }
  }

  return formatDatetimeLocal(date);
}

/**
 * Convert `datetime-local` input value to UTC ISO for the API.
 * When `timeZone` is provided, the wall-clock value is interpreted in that site timezone.
 * Otherwise the browser local timezone is used.
 */
export function toApiDatetimeValue(value: string, timeZone?: string): string {
  if (!value.trim()) return "";

  const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?$/);
  if (localMatch) {
    const [, datePart, timePart, secondsPart] = localMatch;
    const seconds = (secondsPart ?? ":00").slice(1);

    if (timeZone) {
      const utc = zonedWallTimeToUtc(
        datePart!,
        timePart!,
        seconds,
        timeZone,
      );
      if (utc) return utc.toISOString();
    }

    const withSeconds = secondsPart ? value : `${value}:00`;
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

/**
 * Interpret a wall-clock date/time in `timeZone` and return the UTC Date.
 */
function zonedWallTimeToUtc(
  datePart: string,
  timePart: string,
  seconds: string,
  timeZone: string,
): Date | null {
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const second = Number(seconds);

  if (![year, month, day, hour, minute, second].every((n) => Number.isFinite(n))) {
    return null;
  }

  // Start with a UTC guess, then correct by the zone offset at that instant.
  let utcGuess = Date.UTC(year!, month! - 1, day!, hour!, minute!, second!);

  for (let i = 0; i < 3; i += 1) {
    const asLocal = formatDatetimeLocalInTimeZone(new Date(utcGuess), timeZone);
    const match = asLocal.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!match) return null;

    const localAsUtc = Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      second,
    );
    const desiredAsUtc = Date.UTC(year!, month! - 1, day!, hour!, minute!, second!);
    const delta = desiredAsUtc - localAsUtc;
    utcGuess += delta;
    if (delta === 0) break;
  }

  const result = new Date(utcGuess);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function isFutureDatetimeLocal(
  value: string,
  now = new Date(),
  timeZone?: string,
): boolean {
  if (!value.trim()) return false;
  const iso = toApiDatetimeValue(value, timeZone);
  if (!iso) return false;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() > now.getTime();
}
