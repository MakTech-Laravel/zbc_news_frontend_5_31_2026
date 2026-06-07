import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { FeaturedSection } from "@/components/main-layout/content/FeaturedSection";
import { HeroSection } from "@/components/main-layout/content/HeroSection";
import { LatestStories } from "@/components/main-layout/content/LatestStories";


export default function Technology() {
  return (
    <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
      <HeroSection  />
      <AdUnit variant="banner" />
      <FeaturedSection />
      <AdUnit variant="banner" />
      <LatestStories />
     
    </article>
  );
}