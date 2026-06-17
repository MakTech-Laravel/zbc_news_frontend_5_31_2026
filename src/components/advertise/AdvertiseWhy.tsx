import { ADVERTISE_ASSETS, WHY_STATS } from "@/components/advertise/advertiseData";

function WhyStatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="rounded-lg border border-zbc-gray-200 bg-white p-6 text-center shadow-sm">
      <p className="text-2xl font-bold leading-tight text-zbc-blue md:text-3xl">{value}</p>
      <p className="mt-2 text-sm leading-5 text-admin-label md:text-base">{label}</p>
    </article>
  );
}

export function AdvertiseWhy() {
  return (
    <section className="bg-zbc-gray-50 py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-zbc-blue">Why ZBC News</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
              Brand Safety in a Trusted Editorial Environment
            </h2>
            <p className="mt-6 text-base leading-7 text-admin-label md:text-lg">
              News is the last form of media people actively seek out. When readers come to ZBC News, they&apos;re paying
              attention — not passively scrolling. Your brand is seen in context with content people care about.
            </p>
            <p className="mt-4 text-base leading-7 text-admin-label md:text-lg">
              Our editorial independence means the trust our readers place in us extends, to a degree, to the brands that
              choose to advertise with us. We vet partners for value alignment.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {WHY_STATS.map((stat) => (
                <WhyStatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zbc-gray-200 bg-white shadow-sm">
            <img
              src={ADVERTISE_ASSETS.analytics}
              alt="ZBC News advertising analytics dashboard"
              className="size-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
