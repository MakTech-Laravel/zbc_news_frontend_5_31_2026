/** Convert API / ISO datetime strings to `datetime-local` input value (YYYY-MM-DDTHH:mm). */
export function toDatetimeLocalValue(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";

  const apiMatch = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?/);
  if (apiMatch) {
    return `${apiMatch[1]}T${apiMatch[2]}`;
  }

  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Convert `datetime-local` input value to API format (Y-m-d H:i:s). */
export function toApiDatetimeValue(value: string): string {
  if (!value.trim()) return "";

  const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?$/);
  if (localMatch) {
    const seconds = localMatch[3] ?? ":00";
    return `${localMatch[1]} ${localMatch[2]}${seconds}`;
  }

  const apiMatch = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (apiMatch) return value;

  return value;
}

export function isFutureDatetimeLocal(value: string, now = new Date()): boolean {
  if (!value.trim()) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() > now.getTime();
}
