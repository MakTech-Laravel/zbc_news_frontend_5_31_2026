import AuthorProfile from "@/pages/frontend/AuthorProfile";
import { resolvedSeoToMeta } from "@/lib/seoMeta";
import { fetchResolvedSeo } from "@/services/admin/seoPages";

import type { Route } from "./+types/AuthorRoute";

export async function loader({ params }: Route.LoaderArgs) {
  return { seo: await fetchResolvedSeo(`/author/${params.authorSlug}`).catch(() => null) };
}

export function meta({ data }: Route.MetaArgs) {
  return resolvedSeoToMeta(data?.seo);
}

export default function AuthorRoute() {
  return <AuthorProfile />;
}
