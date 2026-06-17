import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { setRuntimePublicUrls } from "@/lib/appOrigins";
import { fetchPublicSeoPages } from "@/services/admin/seoPages";
import { fetchPublicSiteSettings } from "@/services/frontend/siteSettings";
import type { PublicSiteSettings, SeoPage } from "@/types/siteSettings";

type SiteSettingsContextValue = {
  settings: PublicSiteSettings;
  seoPages: SeoPage[];
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_SETTINGS: PublicSiteSettings = {
  siteName: "ZBC News",
  siteTag: "Breaking news and analysis from around the world",
  siteLogo: null,
  timezone: "America/New_York",
  language: "en",
  defaultCategoryId: null,
  defaultPostFormat: "Standard",
  enableAutoSave: true,
  requireFeaturedImage: false,
  postsPerPage: 10,
  allowComments: true,
  requireRegistrationToComment: true,
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
  seoPages: [],
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

  const seoQuery = useQuery({
    queryKey: ["public-seo-pages"],
    queryFn: fetchPublicSeoPages,
    staleTime: 60_000,
  });

  const refresh = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["public-site-settings"] }),
      queryClient.invalidateQueries({ queryKey: ["public-seo-pages"] }),
    ]);
  }, [queryClient]);

  React.useEffect(() => {
    if (!settingsQuery.data) return;
    setRuntimePublicUrls(settingsQuery.data.frontendUrl, settingsQuery.data.apiUrl);
  }, [settingsQuery.data]);

  const value = React.useMemo<SiteSettingsContextValue>(
    () => ({
      settings: settingsQuery.data ?? DEFAULT_SETTINGS,
      seoPages: seoQuery.data ?? [],
      isLoading: settingsQuery.isLoading || seoQuery.isLoading,
      refresh,
    }),
    [settingsQuery.data, settingsQuery.isLoading, seoQuery.data, seoQuery.isLoading, refresh],
  );

  return (
    <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return React.useContext(SiteSettingsContext);
}
