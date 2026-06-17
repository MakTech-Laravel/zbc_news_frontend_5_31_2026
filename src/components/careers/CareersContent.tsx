import { CareersCta } from "@/components/careers/CareersCta";
import { CareersFaq } from "@/components/careers/CareersFaq";
import { CareersHero } from "@/components/careers/CareersHero";
import { CareersHiringProcess } from "@/components/careers/CareersHiringProcess";
import { CareersOpenPositions } from "@/components/careers/CareersOpenPositions";
import { CareersPerks } from "@/components/careers/CareersPerks";
import { CareersTestimonials } from "@/components/careers/CareersTestimonials";

export function CareersContent() {
  return (
    <div className="bg-white">
      <CareersHero />
      <CareersPerks />
      <CareersOpenPositions />
      <CareersHiringProcess />
      <CareersTestimonials />
      <CareersFaq />
      <CareersCta />
    </div>
  );
}
