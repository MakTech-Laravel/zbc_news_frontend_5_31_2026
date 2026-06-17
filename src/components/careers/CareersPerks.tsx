import { CAREERS_PERKS, CAREERS_PERKS_SECTION } from "@/components/careers/careersData";

export function CareersPerks() {
  return (
    <section id="perks" className="bg-zbc-gray-50 py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zbc-red-accent">
            {CAREERS_PERKS_SECTION.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            {CAREERS_PERKS_SECTION.heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {CAREERS_PERKS.map((perk) => (
            <article
              key={perk.title}
              className="rounded-lg border border-zbc-gray-200 bg-white p-8"
            >
              <span className="text-3xl" role="img" aria-hidden>
                {perk.emoji}
              </span>
              <h3 className="pt-4 text-xl font-bold leading-7 text-zbc-gray-1000">{perk.title}</h3>
              <p className="pt-3 text-base leading-6.5 text-admin-label">{perk.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
