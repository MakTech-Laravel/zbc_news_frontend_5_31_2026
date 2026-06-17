import { Check } from "lucide-react";

import { PACKAGES } from "@/components/advertise/advertiseData";

function PackageCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  popular,
}: (typeof PACKAGES)[number]) {
  const isDark = Boolean(popular);

  return (
    <article
      className={`relative flex h-full flex-col rounded-xl border p-8 ${
        isDark
          ? "border-zbc-gray-700 bg-zbc-gray-1000 text-white shadow-xl"
          : "border-zbc-gray-200 bg-white shadow-sm"
      }`}
    >
      {popular ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-zbc-red-accent px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Most Popular
        </span>
      ) : null}

      <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-zbc-gray-1000"}`}>{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className={`text-4xl font-black ${isDark ? "text-white" : "text-zbc-gray-1000"}`}>{price}</span>
        {period ? (
          <span className={`text-base ${isDark ? "text-zbc-gray-400" : "text-admin-label"}`}>{period}</span>
        ) : null}
      </div>
      <p className={`mt-4 text-base leading-6 ${isDark ? "text-zbc-gray-400" : "text-admin-label"}`}>{description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              className={`mt-0.5 size-5 shrink-0 ${isDark ? "text-zbc-blue-muted" : "text-zbc-blue"}`}
              strokeWidth={2.5}
            />
            <span className={`text-sm leading-6 md:text-base ${isDark ? "text-zbc-gray-200" : "text-zbc-text-slate"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg px-6 text-base font-bold transition-colors ${
          isDark
            ? "bg-white text-zbc-blue hover:bg-white/90"
            : "bg-zbc-blue text-white hover:bg-zbc-blue-deep"
        }`}
      >
        {cta}
      </button>
    </article>
  );
}

export function AdvertisePackages() {
  return (
    <section className="bg-zbc-gray-50 py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zbc-blue">Sponsorship</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Packages</h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.name} {...pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
