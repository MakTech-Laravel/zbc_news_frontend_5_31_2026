const SESSION_KEY = "zbc_ad_session_id";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ad-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getAdSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = createSessionId();
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return createSessionId();
  }
}

export async function trackAdEvent(
  slotKey: string,
  eventType: "impression" | "click",
): Promise<void> {
  try {
    const { request } = await import("@/api/request");
    await request.post("/ads/track", {
      slot_key: slotKey,
      event_type: eventType,
      session_id: getAdSessionId(),
    });
  } catch {
    // Non-blocking analytics
  }
}
