import TagArticles from "@/pages/frontend/TagArticles";
import { resolvedSeoToMeta } from "@/lib/seoMeta";
import { fetchResolvedSeo } from "@/services/admin/seoPages";

import type { Route } from "./+types/TagRoute";

export async function loader({ params }: Route.LoaderArgs) {
  return { seo: await fetchResolvedSeo(`/tag/${params.tagSlug}`).catch(() => null) };
}

export function meta({ data }: Route.MetaArgs) {
  return resolvedSeoToMeta(data?.seo);
}

export default function TagRoute() {
  return <TagArticles />;
}
