import { useParams } from "react-router-dom";

import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { CategoryArticlesView } from "@/components/main-layout/content/CategoryArticlesView";
import { FeaturedSection } from "@/components/main-layout/content/FeaturedSection";
import { HeroSection } from "@/components/main-layout/content/HeroSection";
import { LatestStories } from "@/components/main-layout/content/LatestStories";

export default function Home() {
  const { slug } = useParams<{ slug?: string }>();

  if (slug) {
    return <CategoryArticlesView categorySlug={slug} />;
  }

  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      <HeroSection  />
      <AdUnit variant="banner" />
      <FeaturedSection />
      <ArticleGrid />
      <AdUnit variant="banner" />
      <LatestStories  />
      <AdUnit variant="banner" />
    </article>
  );
}
