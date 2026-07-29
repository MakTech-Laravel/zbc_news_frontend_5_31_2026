import * as React from "react";

import {
  acceptAllCookiePreferences,
  DEFAULT_CONSENT_PREFERENCES,
  hasCookieConsentChoice,
  readCookieConsent,
  rejectOptionalCookiePreferences,
  writeCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookieConsent";
import type { CookieCategoryId } from "@/services/admin/cookiePolicy";

type CookieConsentContextValue = {
  ready: boolean;
  hasChoice: boolean;
  preferences: CookieConsentPreferences;
  allowAnalytics: boolean;
  allowPreferences: boolean;
  allowAdvertising: boolean;
  savePreferences: (next: CookieConsentPreferences) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  openPreferences: () => void;
  preferencesOpen: boolean;
  setPreferencesOpen: (open: boolean) => void;
};

const CookieConsentContext = React.createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [hasChoice, setHasChoice] = React.useState(false);
  const [preferences, setPreferences] =
    React.useState<CookieConsentPreferences>(DEFAULT_CONSENT_PREFERENCES);
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);

  React.useEffect(() => {
    const existing = readCookieConsent();
    if (existing) {
      setPreferences(existing.preferences);
      setHasChoice(true);
    } else {
      setHasChoice(hasCookieConsentChoice());
    }
    setReady(true);
  }, []);

  const savePreferences = React.useCallback((next: CookieConsentPreferences) => {
    const normalized: CookieConsentPreferences = {
      essential: true,
      analytics: Boolean(next.analytics),
      preferences: Boolean(next.preferences),
      advertising: Boolean(next.advertising),
    };
    const saved = writeCookieConsent(normalized);
    setPreferences(saved.preferences);
    setHasChoice(true);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = React.useCallback(() => {
    savePreferences(acceptAllCookiePreferences());
  }, [savePreferences]);

  const rejectOptional = React.useCallback(() => {
    savePreferences(rejectOptionalCookiePreferences());
  }, [savePreferences]);

  const openPreferences = React.useCallback(() => {
    setPreferencesOpen(true);
  }, []);

  const value = React.useMemo<CookieConsentContextValue>(
    () => ({
      ready,
      hasChoice,
      preferences,
      allowAnalytics: hasChoice && preferences.analytics,
      allowPreferences: hasChoice && preferences.preferences,
      allowAdvertising: hasChoice && preferences.advertising,
      savePreferences,
      acceptAll,
      rejectOptional,
      openPreferences,
      preferencesOpen,
      setPreferencesOpen,
    }),
    [
      ready,
      hasChoice,
      preferences,
      savePreferences,
      acceptAll,
      rejectOptional,
      openPreferences,
      preferencesOpen,
    ],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = React.useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}

export function useCookieCategoryAllowed(category: CookieCategoryId): boolean {
  const { hasChoice, preferences, ready } = useCookieConsent();
  if (!ready) return false;
  if (category === "essential") return true;
  return hasChoice && preferences[category];
}
