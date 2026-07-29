import type { CareersPerk } from "@/components/careers/careersData";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const ICON_BOX = "size-12 shrink-0";

type CareersPerksProps = {
  section: { eyebrow: string; heading: string };
  perks: CareersPerk[];
};

function PerkIcon({ perk }: { perk: CareersPerk }) {
  const iconUrl = perk.icon?.trim() ? resolveMediaUrl(perk.icon) : "";

  if (iconUrl) {
    return (
      <span
        className={`inline-flex ${ICON_BOX} items-center justify-center overflow-hidden rounded-lg bg-zbc-gray-50`}
      >
        <img
          src={iconUrl}
          alt=""
          width={48}
          height={48}
          className="size-12 object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex ${ICON_BOX} items-center justify-center rounded-lg bg-zbc-gray-50 text-2xl`}
      role="img"
      aria-hidden
    >
      {perk.emoji || "✦"}
    </span>
  );
}

export function CareersPerks({ section, perks }: CareersPerksProps) {
  return (
    <section id="perks" className="bg-zbc-gray-50 py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zbc-red-accent">
            {section.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            {section.heading}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {perks.map((perk) => (
            <article
              key={perk.title}
              className="rounded-lg border border-zbc-gray-200 bg-white p-8"
            >
              <PerkIcon perk={perk} />
              <h3 className="pt-4 text-xl font-bold leading-7 text-zbc-gray-1000">
                {perk.title}
              </h3>
              <p className="pt-3 text-base leading-6.5 text-admin-label">
                {perk.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
