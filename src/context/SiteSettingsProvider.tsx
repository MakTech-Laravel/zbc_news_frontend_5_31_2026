import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { setRuntimePublicUrls } from "@/lib/appOrigins";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { fetchPublicSiteSettings } from "@/services/frontend/siteSettings";
import type { PublicSiteSettings } from "@/types/siteSettings";
import { setFavicon } from "@/utils/favicon";

type SiteSettingsContextValue = {
  settings: PublicSiteSettings;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_SETTINGS: PublicSiteSettings = {
  siteName: "ZBC News",
  siteTag: "Breaking news and analysis from around the world",
  siteLogo: null,
  siteFavicon: null,
  timezone: "America/New_York",
  language: "en",
  defaultCategoryId: null,
  defaultPostFormat: "Standard",
  enableAutoSave: true,
  requireFeaturedImage: false,
  postsPerPage: 10,
  allowComments: true,
  requireRegistrationToComment: false,
  autoApproveKnownUsers: false,
  relatedArticlesCount: 3,
  googleAnalyticsId: "",
  facebookPixelId: "",
  disqusShortname: "",
  frontendUrl: null,
  apiUrl: null,
};

const SiteSettingsContext = React.createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: fetchPublicSiteSettings,
    staleTime: 60_000,
  });

  const refresh = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["public-site-settings"] }),
      queryClient.invalidateQueries({ queryKey: ["seo-resolve"] }),
    ]);
  }, [queryClient]);

  React.useEffect(() => {
    if (!settingsQuery.data) return;
    setRuntimePublicUrls(settingsQuery.data.frontendUrl, settingsQuery.data.apiUrl);
    const faviconUrl = settingsQuery.data.siteFavicon
      ? resolveMediaUrl(settingsQuery.data.siteFavicon)
      : "";
    setFavicon(faviconUrl || undefined);
  }, [settingsQuery.data]);

  const value = React.useMemo<SiteSettingsContextValue>(
    () => ({
      settings: settingsQuery.data ?? DEFAULT_SETTINGS,
      isLoading: settingsQuery.isLoading,
      refresh,
    }),
    [settingsQuery.data, settingsQuery.isLoading, refresh],
  );

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return React.useContext(SiteSettingsContext);
}
