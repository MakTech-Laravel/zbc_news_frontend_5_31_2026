import { ArrowRight } from "lucide-react";

import { CAREERS_HERO, CAREERS_STATS } from "@/components/careers/careersData";

export function CareersHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#1c398e] via-[#193cb8] to-zbc-gray-1000 py-20 md:py-24">
      <div className="absolute inset-0 opacity-10" aria-hidden />
      <div className="relative mx-auto container px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex rounded bg-zbc-red-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              {CAREERS_HERO.badge}
            </span>
            <h1 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              {CAREERS_HERO.headline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zbc-blue-light md:text-lg">
              {CAREERS_HERO.subheadline}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#open-positions"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-white px-6 text-base font-bold text-zbc-blue transition-colors hover:bg-white/90"
              >
                {CAREERS_HERO.primaryCta}
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </a>
              <a
                href="#perks"
                className="inline-flex min-h-12 items-center justify-center rounded border-2 border-white px-6 text-base font-bold text-white transition-colors hover:bg-white/10"
              >
                {CAREERS_HERO.secondaryCta}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {CAREERS_STATS.map((stat) => (
              <article
                key={stat.label}
                className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
              >
                <p className="text-3xl font-black text-white md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-zbc-blue-light">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
