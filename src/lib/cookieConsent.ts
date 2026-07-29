import type { CookieCategoryId } from "@/services/admin/cookiePolicy";

export const COOKIE_CONSENT_STORAGE_KEY = "zbc_cookie_consent";
export const COOKIE_CONSENT_COOKIE_NAME = "zbc_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_DAYS = 365;

export type CookieConsentPreferences = Record<CookieCategoryId, boolean>;

export type CookieConsentState = {
  version: number;
  consentedAt: string;
  preferences: CookieConsentPreferences;
};

export const DEFAULT_CONSENT_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  analytics: false,
  preferences: false,
  advertising: false,
};

function canUseDom(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function writeBrowserCookie(value: string): void {
  if (!canUseDom()) return;
  const maxAge = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function readBrowserCookie(): string | null {
  if (!canUseDom()) return null;
  const prefix = `${COOKIE_CONSENT_COOKIE_NAME}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return null;
  }
}

function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    if (!parsed.consentedAt || !parsed.preferences) return null;

    return {
      version: COOKIE_CONSENT_VERSION,
      consentedAt: parsed.consentedAt,
      preferences: {
        essential: true,
        analytics: Boolean(parsed.preferences.analytics),
        preferences: Boolean(parsed.preferences.preferences),
        advertising: Boolean(parsed.preferences.advertising),
      },
    };
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentState | null {
  if (!canUseDom()) return null;

  try {
    const fromStorage = parseConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
    if (fromStorage) return fromStorage;
  } catch {
    // ignore storage errors
  }

  return parseConsent(readBrowserCookie());
}

export function writeCookieConsent(preferences: CookieConsentPreferences): CookieConsentState {
  const state: CookieConsentState = {
    version: COOKIE_CONSENT_VERSION,
    consentedAt: new Date().toISOString(),
    preferences: {
      essential: true,
      analytics: Boolean(preferences.analytics),
      preferences: Boolean(preferences.preferences),
      advertising: Boolean(preferences.advertising),
    },
  };

  const serialized = JSON.stringify(state);

  if (canUseDom()) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, serialized);
    } catch {
      // ignore storage errors
    }
    writeBrowserCookie(serialized);
  }

  return state;
}

export function hasCookieConsentChoice(): boolean {
  return readCookieConsent() !== null;
}

export function acceptAllCookiePreferences(): CookieConsentPreferences {
  return {
    essential: true,
    analytics: true,
    preferences: true,
    advertising: true,
  };
}

export function rejectOptionalCookiePreferences(): CookieConsentPreferences {
  return {
    essential: true,
    analytics: false,
    preferences: false,
    advertising: false,
  };
}
