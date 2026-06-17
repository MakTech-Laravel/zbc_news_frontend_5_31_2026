import { CAREERS_HIRING_SECTION, HIRING_STEPS } from "@/components/careers/careersData";

export function CareersHiringProcess() {
  return (
    <section className="bg-linear-to-br from-[#1c398e] via-zbc-hero-navy to-zbc-gray-1000 py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zbc-blue-light">
            {CAREERS_HIRING_SECTION.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">
            {CAREERS_HIRING_SECTION.heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {HIRING_STEPS.map((step) => (
            <article
              key={step.number}
              className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
            >
              <span className="text-2xl font-black text-zbc-blue-light">{step.number}</span>
              <h3 className="mt-4 text-lg font-bold leading-7 text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zbc-blue-light">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
