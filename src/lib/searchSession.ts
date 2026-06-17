const SEARCH_SESSION_KEY = "zbc_search_session_id";

export function getSearchSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(SEARCH_SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SEARCH_SESSION_KEY, id);
  }

  return id;
}

export function getSearchSessionHeaders(): Record<string, string> {
  const sessionId = getSearchSessionId();
  return sessionId ? { "X-Search-Session-Id": sessionId } : {};
}
