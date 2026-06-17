import { Megaphone, Mail, FileText, Play, Mic, PenLine } from "lucide-react";

import { PLACEMENTS } from "@/components/advertise/advertiseData";

const PLACEMENT_ICONS = [Megaphone, Mail, FileText, Play, Mic, PenLine] as const;

function PlacementCard({
  title,
  description,
  price,
  badge,
  Icon,
}: (typeof PLACEMENTS)[number] & { Icon: typeof Megaphone }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-zbc-gray-200 bg-white p-6 shadow-sm">
      <div className="inline-flex size-12 items-center justify-center rounded-full bg-zbc-blue-light text-zbc-blue">
        <Icon className="size-6" strokeWidth={2} />
      </div>
      <h3 className="mt-5 text-xl font-bold leading-7 text-zbc-gray-1000">{title}</h3>
      <p className="mt-3 flex-1 text-base leading-6 text-admin-label">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zbc-gray-200 pt-5">
        <p className="text-lg font-bold text-zbc-blue">{price}</p>
        <span className="rounded-full bg-zbc-gray-100 px-3 py-1 text-xs font-semibold text-zbc-text-slate">
          {badge}
        </span>
      </div>
    </article>
  );
}

export function AdvertisePlacements() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-zbc-blue">Advertising Products</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Ad Placement Options</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PLACEMENTS.map((placement, index) => (
            <PlacementCard key={placement.title} {...placement} Icon={PLACEMENT_ICONS[index]} />
          ))}
        </div>
      </div>
    </section>
  );
}
