import Home from "@/pages/frontend/Home";
import { resolvedSeoToMeta } from "@/lib/seoMeta";
import { fetchResolvedSeo } from "@/services/admin/seoPages";

import type { Route } from "./+types/HomeRoute";

export async function loader() {
  return { seo: await fetchResolvedSeo("/").catch(() => null) };
}

export function meta({ data }: Route.MetaArgs) {
  return resolvedSeoToMeta(data?.seo);
}

export default function HomeRoute() {
  return <Home />;
}
