import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { FeaturedSection } from "@/components/main-layout/content/FeaturedSection";
import { HeroSection } from "@/components/main-layout/content/HeroSection";
import { LatestStories } from "@/components/main-layout/content/LatestStories";
import { latestStories } from "@/data/dummy/home";
import { heroArticle } from "@/data/dummy/entertainment";


export default function Entertainment() {
  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      <HeroSection article={heroArticle} />
      <AdUnit variant="banner" />
      <FeaturedSection />
      <AdUnit variant="banner" />
      <LatestStories articles={latestStories} />
     
    </article>
  );
}