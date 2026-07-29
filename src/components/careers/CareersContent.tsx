import { useEffect, useState } from "react";

import { CareersApplyModal } from "@/components/careers/CareersApplyModal";
import { CareersCta } from "@/components/careers/CareersCta";
import { CareersFaq } from "@/components/careers/CareersFaq";
import { CareersHero } from "@/components/careers/CareersHero";
import { CareersHiringProcess } from "@/components/careers/CareersHiringProcess";
import { CareersOpenPositions } from "@/components/careers/CareersOpenPositions";
import { CareersPerks } from "@/components/careers/CareersPerks";
import { CareersTestimonials } from "@/components/careers/CareersTestimonials";
import {
  CAREERS_CTA,
  CAREERS_FAQ_SECTION,
  CAREERS_HERO,
  CAREERS_HIRING_SECTION,
  CAREERS_PERKS,
  CAREERS_PERKS_SECTION,
  CAREERS_POSITIONS_SECTION,
  CAREERS_STATS,
  CAREERS_TESTIMONIALS_SECTION,
  FAQ_ITEMS,
  HIRING_STEPS,
  TEAM_TESTIMONIALS,
  type JobListing,
} from "@/components/careers/careersData";
import type { CareerJob, CareersPageContent } from "@/services/admin/careers";
import {
  fetchPublicCareerJobs,
  fetchPublicCareersPage,
} from "@/services/frontend/careers";

function mapJobs(jobs: CareerJob[]): JobListing[] {
  return jobs.map((job) => ({
    id: String(job.id),
    numericId: job.id,
    title: job.title,
    type: (job.employment_type || job.type || "Full-time") as JobListing["type"],
    department: job.department as JobListing["department"],
    location: job.location,
  }));
}

export function CareersContent() {
  const [page, setPage] = useState<CareersPageContent | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyJob, setApplyJob] = useState<JobListing | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const [pageData, jobsData] = await Promise.all([
          fetchPublicCareersPage(),
          fetchPublicCareerJobs(),
        ]);
        if (cancelled) return;
        setPage(pageData);
        setJobs(mapJobs(jobsData));
      } catch {
        if (!cancelled) {
          setPage(null);
          setJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hero = page?.hero
    ? {
        badge: page.hero.badge,
        headline: page.hero.headline,
        subheadline: page.hero.subheadline,
        primaryCta: page.hero.primary_cta,
        secondaryCta: page.hero.secondary_cta,
      }
    : CAREERS_HERO;

  const stats = page?.stats?.length ? page.stats : CAREERS_STATS;
  const perksSection = page?.perks_section ?? CAREERS_PERKS_SECTION;
  const perks = page?.perks?.length ? page.perks : CAREERS_PERKS;
  const positionsSection = page?.positions_section
    ? {
        eyebrow: page.positions_section.eyebrow,
        heading: page.positions_section.heading,
        searchPlaceholder: page.positions_section.search_placeholder,
      }
    : CAREERS_POSITIONS_SECTION;
  const hiringSection = page?.hiring_section ?? CAREERS_HIRING_SECTION;
  const hiringSteps = page?.hiring_steps?.length ? page.hiring_steps : HIRING_STEPS;
  const testimonialsSection =
    page?.testimonials_section ?? CAREERS_TESTIMONIALS_SECTION;
  const testimonials = page?.testimonials?.length
    ? page.testimonials
    : TEAM_TESTIMONIALS;
  const faqSection = page?.faq_section ?? CAREERS_FAQ_SECTION;
  const faqs = page?.faqs?.length ? page.faqs : FAQ_ITEMS;
  const cta = page?.cta
    ? {
        heading: page.cta.heading,
        description: page.cta.description,
        button: page.cta.button,
        buttonUrl: page.cta.button_url || "/contact",
      }
    : { ...CAREERS_CTA, buttonUrl: "/contact" };

  return (
    <div className="bg-white">
      <CareersHero hero={hero} stats={stats} />
      <CareersPerks section={perksSection} perks={perks} />
      <CareersOpenPositions
        section={positionsSection}
        jobs={jobs}
        loading={loading}
        onApply={setApplyJob}
      />
      <CareersHiringProcess section={hiringSection} steps={hiringSteps} />
      <CareersTestimonials
        section={testimonialsSection}
        testimonials={testimonials}
      />
      <CareersFaq section={faqSection} faqs={faqs} />
      <CareersCta cta={cta} />
      <CareersApplyModal
        job={applyJob}
        open={Boolean(applyJob)}
        onClose={() => setApplyJob(null)}
      />
    </div>
  );
}
