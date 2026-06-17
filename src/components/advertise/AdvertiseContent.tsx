import { AdvertiseCaseStudies } from "@/components/advertise/AdvertiseCaseStudies";
import { AdvertiseCta } from "@/components/advertise/AdvertiseCta";
import { AdvertiseHero } from "@/components/advertise/AdvertiseHero";
import { AdvertisePackages } from "@/components/advertise/AdvertisePackages";
import { AdvertisePlacements } from "@/components/advertise/AdvertisePlacements";
import { AdvertiseWhy } from "@/components/advertise/AdvertiseWhy";

export function AdvertiseContent() {
  return (
    <div className="bg-white">
      <AdvertiseHero />
      <AdvertiseWhy />
      <AdvertisePlacements />
      <AdvertisePackages />
      <AdvertiseCaseStudies />
      <AdvertiseCta />
    </div>
  );
}
