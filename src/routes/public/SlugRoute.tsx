import { CategoryArticlesView } from "@/components/main-layout/content/CategoryArticlesView";
import { ArticleContent } from "@/components/main-layout/NewsDetails/Details";
import { resolvedSeoToMeta } from "@/lib/seoMeta";
import { fetchResolvedSeo } from "@/services/admin/seoPages";
import { fetchArticleBySlug } from "@/services/frontend/articles";

import type { Route } from "./+types/SlugRoute";

/**
 * `/:slug` is an article OR a category. Disambiguate on the server (article
 * wins, matching the pre-SSR Home.tsx fallback order) so crawlers get the
 * correct SEO and the article body without a client round-trip.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug;
  const decoded = decodeURIComponent(slug);

  const article = await fetchArticleBySlug(decoded).catch(() => null);
  const seo = await fetchResolvedSeo(`/${slug}`).catch(() => null);

  if (article) {
    return { kind: "article" as const, slug, article, seo };
  }

  return { kind: "category" as const, slug, seo };
}

export function meta({ data }: Route.MetaArgs) {
  return resolvedSeoToMeta(data?.seo);
}

export default function SlugRoute({ loaderData }: Route.ComponentProps) {
  if (loaderData.kind === "article") {
    return (
      <article className="flex flex-col gap-5 bg-background sm:gap-7 lg:gap-8">
        <ArticleContent article={loaderData.article} />
      </article>
    );
  }

  return <CategoryArticlesView categorySlug={loaderData.slug} />;
}
