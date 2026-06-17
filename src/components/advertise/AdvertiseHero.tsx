import { HERO_STATS } from "@/components/advertise/advertiseData";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="rounded-lg border border-white/15 bg-white/10 p-5 text-center backdrop-blur-sm md:p-6">
      <p className="text-2xl font-bold leading-tight text-white md:text-3xl">{value}</p>
      <p className="mt-1 text-sm leading-5 text-zbc-blue-light md:text-base">{label}</p>
    </article>
  );
}

export function AdvertiseHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-zbc-hero-navy via-zbc-blue-accent to-zbc-gray-1000 py-20 md:py-28">
      <div className="absolute inset-0 opacity-10">
        <div className="size-full bg-[radial-gradient(circle_at_top_right,#bedbff_0%,transparent_55%)]" />
      </div>

      <div className="relative mx-auto container px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zbc-blue-muted">Media &amp; Partnerships</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
            Reach an Audience That Reads Deeply and Decides Boldly
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-zbc-blue-light md:text-xl">
            ZBC News&apos;s readers are engaged, educated, and influential. Our advertising partners reach them without
            compromising the editorial integrity that makes that audience worth reaching.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-zbc-blue transition-colors hover:bg-white/90 sm:w-auto"
            >
              Request Media Kit
            </button>
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-white px-8 text-base font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Book a Consultation
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {HERO_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
