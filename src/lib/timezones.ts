export type TimezoneOption = {
  value: string;
  label: string;
};

const FALLBACK_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Tokyo",
] as const;

function listSupportedTimeZones(): string[] {
  try {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      return [...Intl.supportedValuesOf("timeZone")];
    }
  } catch {
    // fall through
  }
  return [...FALLBACK_TIMEZONES];
}

function formatUtcOffset(timeZone: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
      hour: "numeric",
    }).formatToParts(at);
    const offset = parts.find((part) => part.type === "timeZoneName")?.value;
    if (offset) {
      return offset.replace("GMT", "UTC");
    }
  } catch {
    // fall through
  }
  return "UTC";
}

function formatTimezoneLabel(timeZone: string): string {
  const readable = timeZone.replace(/_/g, " ");
  return `${readable} (${formatUtcOffset(timeZone)})`;
}

/** Full IANA timezone list for admin Settings (and similar selects). */
export function getTimezoneOptions(preferredValue?: string | null): TimezoneOption[] {
  const zones = new Set(listSupportedTimeZones());
  if (preferredValue?.trim()) {
    zones.add(preferredValue.trim());
  }

  return [...zones]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      value,
      label: formatTimezoneLabel(value),
    }));
}
