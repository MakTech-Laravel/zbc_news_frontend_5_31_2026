import { Star } from "lucide-react";

import {
  CAREERS_TESTIMONIALS_SECTION,
  TEAM_TESTIMONIALS,
} from "@/components/careers/careersData";

export function CareersTestimonials() {
  return (
    <section className="bg-zbc-gray-50 py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zbc-red-accent">
            {CAREERS_TESTIMONIALS_SECTION.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            {CAREERS_TESTIMONIALS_SECTION.heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TEAM_TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex flex-col rounded-lg border border-zbc-gray-200 bg-white p-8"
            >
              <div className="flex gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star
                    key={index}
                    className="size-4 fill-zbc-red-accent text-zbc-red-accent"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-base leading-6.5 text-admin-label">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-zbc-blue to-zbc-blue-deep">
                  <span className="text-sm font-bold text-white">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-zbc-gray-1000">{testimonial.name}</p>
                  <p className="text-sm text-zbc-blue">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
