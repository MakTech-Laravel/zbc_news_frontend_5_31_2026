import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { FeaturedSection } from "@/components/main-layout/content/FeaturedSection";
import { HeroSection } from "@/components/main-layout/content/HeroSection";
import { LatestStories } from "@/components/main-layout/content/LatestStories";
import {
  gridArticles,
  heroArticle,
  latestStories,
} from "@/data/dummy/home";

export default function Home() {
  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      <HeroSection article={heroArticle} />
      <AdUnit variant="banner" />
      <FeaturedSection />
      <ArticleGrid articles={gridArticles} />
      <AdUnit variant="banner" />
      <LatestStories articles={latestStories} />
      <AdUnit variant="banner" />
    </article>
  );
}
