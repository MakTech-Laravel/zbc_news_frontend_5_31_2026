import { useEffect, useState } from "react";

import { resolveAboutValueIcon } from "@/components/about-us/aboutValueIcons";
import type { AboutUsContent as AboutUsApiContent } from "@/services/admin/aboutUs";
import { fetchPublicAboutUs } from "@/services/frontend/aboutUs";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";

type ValueItem = {
  title: string;
  description: string;
  icon: string;
};

type Leader = {
  name: string;
  role: string;
  bio: string;
  initials: string;
  photo?: string | null;
};

type JourneyItem = {
  year: string;
  shortYear: string;
  description: string;
};

function ValueCard({ title, description, icon }: ValueItem) {
  const Icon = resolveAboutValueIcon(icon);

  return (
    <article className="rounded-lg border border-zbc-gray-200 bg-white p-8">
      <div className="inline-flex size-16 items-center justify-center rounded-full bg-[#dbeafe] text-zbc-blue">
        <Icon className="size-7" strokeWidth={2.2} />
      </div>
      <h3 className="pt-6 text-xl font-bold leading-7 text-zbc-gray-1000">{title}</h3>
      <p className="pt-3 text-base leading-6.5 text-admin-label">{description}</p>
    </article>
  );
}

function LeaderCard({ name, role, bio, initials, photo }: Leader) {
  const photoUrl = photo ? resolveMediaUrl(photo) : "";

  return (
    <article className="rounded-lg border border-zbc-gray-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-zbc-blue to-[#1447e6]">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="size-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-white">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-7 text-zbc-gray-1000">{name}</h3>
          <p className="text-sm font-semibold leading-5 text-zbc-blue">{role}</p>
          <p className="pt-2 text-sm leading-[1.42rem] text-admin-label">{bio}</p>
        </div>
      </div>
    </article>
  );
}

function JourneyRow({ year, shortYear, description, right }: JourneyItem & { right: boolean }) {
  return (
    <div className={`relative grid items-center gap-6 md:grid-cols-2 ${right ? "md:[&>article]:col-start-2" : ""}`}>
      <article
        className={`rounded-lg border border-zbc-gray-200 bg-white p-6 shadow-sm ${right ? "text-left" : "text-left md:text-right"}`}
      >
        <p className="text-sm font-bold leading-5 text-zbc-blue">{year}</p>
        <p className="pt-1 text-base leading-6.5 text-[#1e2939]">{description}</p>
      </article>
      <div className="hidden md:block" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
        <span className="flex size-12 items-center justify-center rounded-full bg-zbc-blue text-sm font-bold text-white">
          {shortYear}
        </span>
      </div>
      <div className="flex md:hidden">
        <span className="flex size-10 items-center justify-center rounded-full bg-zbc-blue text-xs font-bold text-white">
          {shortYear}
        </span>
      </div>
    </div>
  );
}

export function AboutUsContent() {
  const [content, setContent] = useState<AboutUsApiContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setContent(await fetchPublicAboutUs());
      } catch {
        setError("Unable to load the About Us page right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">Loading About Us…</div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        {error ?? "About Us is unavailable."}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-linear-to-br from-[#1c398e] via-[#193cb8] to-zbc-gray-1000 py-24 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://www.figma.com/api/mcp/asset/895baa92-c0de-4924-964e-de5a7233915b"
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="relative mx-auto container px-4 text-center">
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl md:leading-tight">
            {content.hero_title}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-light leading-relaxed text-[#dbeafe] md:text-2xl">
            {content.hero_subtitle}
          </p>
        </div>
      </section>

      <section className="bg-zbc-gray-50 py-20 md:py-24">
        <div className="mx-auto container px-4 text-center">
          <div
            className={cn(
              "mx-auto max-w-4xl text-lg leading-[1.65] text-admin-label md:text-xl",
              "[&_p]:mx-auto [&_p]:max-w-4xl",
              "[&_strong]:font-bold [&_strong]:text-zbc-gray-1000",
              "[&_a]:font-semibold [&_a]:text-zbc-blue",
            )}
            dangerouslySetInnerHTML={{ __html: content.intro_html }}
          />
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto container px-4">
          <h2 className="text-center text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            Our Core Values
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.values.map((item) => (
              <ValueCard
                key={`${item.title}-${item.icon}`}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zbc-gray-50 py-20 md:py-24">
        <div className="mx-auto container px-4">
          <h2 className="text-center text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            Our Leadership
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-6 text-admin-label">
            {content.leadership_subtitle}
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {content.leaders.map((leader) => (
              <LeaderCard key={`${leader.name}-${leader.role}`} {...leader} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto container max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Our Journey</h2>
          <div className="relative mt-12 space-y-10 md:space-y-12">
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-[#bedbff] md:block" />
            {content.journey.map((item, index) => (
              <JourneyRow
                key={`${item.year}-${item.short_year}-${index}`}
                year={item.year}
                shortYear={item.short_year}
                description={item.description}
                right={index % 2 === 1}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
