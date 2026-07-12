import { Outlet } from "react-router";

import { resolvedSeoToMeta } from "@/lib/seoMeta";
import { fetchResolvedSeo } from "@/services/admin/seoPages";

import type { Route } from "./+types/StaticSeoLayout";

/**
 * Shared SSR SEO for static content pages: resolves the seo_pages row for the
 * request path and emits it via meta(). One module covers every static page.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const path = new URL(request.url).pathname;
  return { seo: await fetchResolvedSeo(path).catch(() => null) };
}

export function meta({ data }: Route.MetaArgs) {
  return resolvedSeoToMeta(data?.seo);
}

export default function StaticSeoLayout() {
  return <Outlet />;
}
