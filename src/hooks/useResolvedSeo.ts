import { useQuery } from "@tanstack/react-query";

import { fetchResolvedSeo } from "@/services/admin/seoPages";
import type { ResolvedSeo } from "@/types/resolvedSeo";

/** Authenticated back-office areas don't need public SEO resolution. */
function shouldResolve(path: string): boolean {
  return !/^\/(admin|user)(\/|$)/.test(path);
}

/**
 * Resolve fully-interpolated SEO metadata for a public path from the backend.
 * Cached per-path; the backend is the single source of truth for interpolation.
 */
export function useResolvedSeo(path: string) {
  return useQuery<ResolvedSeo | null>({
    queryKey: ["seo-resolve", path],
    queryFn: () => fetchResolvedSeo(path),
    enabled: shouldResolve(path),
    staleTime: 60_000,
  });
}
