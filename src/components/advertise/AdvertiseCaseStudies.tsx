import { Star } from "lucide-react";

import { CASE_STUDIES } from "@/components/advertise/advertiseData";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-zbc-gray-200"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function CaseStudyCard({ title, rating, summary, image, imageAlt }: (typeof CASE_STUDIES)[number]) {
  return (
    <article className="overflow-hidden rounded-xl border border-zbc-gray-200 bg-white shadow-sm">
      <div className="aspect-[16/10] overflow-hidden">
        <img src={image} alt={imageAlt} className="size-full object-cover" />
      </div>
      <div className="p-6 md:p-8">
        <StarRating rating={rating} />
        <h3 className="mt-4 text-xl font-bold leading-7 text-zbc-gray-1000">{title}</h3>
        <p className="mt-3 text-base leading-6 text-admin-label">{summary}</p>
        <button
          type="button"
          className="mt-6 text-base font-bold text-zbc-blue transition-colors hover:text-zbc-blue-deep"
        >
          Read Full Case Study
        </button>
      </div>
    </article>
  );
}

export function AdvertiseCaseStudies() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zbc-blue">Proof Points</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Case Studies</h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {CASE_STUDIES.map((study) => (
            <CaseStudyCard key={study.title} {...study} />
          ))}
        </div>
      </div>
    </section>
  );
}
