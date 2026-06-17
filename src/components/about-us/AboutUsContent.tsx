import { Bolt, Eye, ShieldCheck } from "lucide-react";

type ValueItem = {
  title: string;
  description: string;
  Icon: typeof ShieldCheck;
};

type Leader = {
  name: string;
  role: string;
  bio: string;
  initials: string;
};

type JourneyItem = {
  year: string;
  shortYear: string;
  description: string;
};

const VALUES: ValueItem[] = [
  {
    title: "Integrity",
    description: "Every fact is verified by multiple sources. We correct errors promptly and transparently.",
    Icon: ShieldCheck,
  },
  {
    title: "Speed",
    description: "Breaking news delivered in real-time without sacrificing accuracy or context.",
    Icon: Bolt,
  },
  {
    title: "Depth",
    description: "We go beyond the headlines to provide analysis, background, and diverse perspectives.",
    Icon: Eye,
  },
];

const LEADERS: Leader[] = [
  {
    name: "Sarah Johnson",
    role: "Editor-in-Chief",
    bio: "20+ years in investigative journalism, Pulitzer Prize winner 2019",
    initials: "SJ",
  },
  {
    name: "Marcus Chen",
    role: "Managing Editor",
    bio: "Former NYT correspondent, specialized in global affairs",
    initials: "MC",
  },
  {
    name: "Elena Rodriguez",
    role: "Senior Political Editor",
    bio: "15 years covering Washington, Georgetown journalism faculty",
    initials: "ER",
  },
  {
    name: "David Kim",
    role: "Technology Editor",
    bio: "MIT graduate, covered Silicon Valley for a decade",
    initials: "DK",
  },
  {
    name: "Amara Okonkwo",
    role: "International Correspondent",
    bio: "Reports from 40+ countries, fluent in 5 languages",
    initials: "AO",
  },
  {
    name: "James Foster",
    role: "Investigations Director",
    bio: "Led award-winning investigations into corporate fraud",
    initials: "JF",
  },
];

const JOURNEY: JourneyItem[] = [
  { year: "2018", shortYear: "18", description: "ZBC News founded with mission to deliver unbiased reporting" },
  { year: "2020", shortYear: "20", description: "Reached 1 million monthly readers" },
  { year: "2022", shortYear: "22", description: "Won Edward R. Murrow Award for investigative journalism" },
  { year: "2024", shortYear: "24", description: "Expanded to 50+ countries with global correspondent network" },
  { year: "2026", shortYear: "26", description: "Launched AI-powered fact-checking initiative" },
];

function ValueCard({ title, description, Icon }: ValueItem) {
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

function LeaderCard({ name, role, bio, initials }: Leader) {
  return (
    <article className="rounded-lg border border-zbc-gray-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-zbc-blue to-[#1447e6]">
          <span className="text-lg font-bold text-white">{initials}</span>
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
      <article className={`rounded-lg border border-zbc-gray-200 bg-white p-6 shadow-sm ${right ? "text-left" : "text-left md:text-right"}`}>
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
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl md:leading-tight">About ZBC News</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-light leading-relaxed text-[#dbeafe] md:text-2xl">
            Independent journalism. Bold storytelling. Unbiased reporting.
          </p>
        </div>
      </section>

      <section className="bg-zbc-gray-50 py-20 md:py-24">
        <div className="mx-auto container px-4 text-center">
          <p className="mx-auto max-w-4xl text-lg leading-[1.65] text-admin-label md:text-xl">
            Since 2018, ZBC News has been dedicated to delivering{" "}
            <span className="font-bold text-zbc-gray-1000">fearless, fact-based journalism</span> that holds power
            accountable. We believe informed citizens make better decisions, and our mission is to provide the depth,
            context, and analysis that today&apos;s fast-paced news cycle often overlooks. From Washington to Nairobi,
            our global team of correspondents brings you stories that matter.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto container px-4">
          <h2 className="text-center text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Our Core Values</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {VALUES.map((item) => (
              <ValueCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zbc-gray-50 py-20 md:py-24">
        <div className="mx-auto container px-4">
          <h2 className="text-center text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Our Leadership</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-6 text-admin-label">
            Led by award-winning journalists and editors with decades of combined experience
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {LEADERS.map((leader) => (
              <LeaderCard key={leader.name} {...leader} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto container max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">Our Journey</h2>
          <div className="relative mt-12 space-y-10 md:space-y-12">
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-[#bedbff] md:block" />
            {JOURNEY.map((item, index) => (
              <JourneyRow key={item.year} {...item} right={index % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-linear-to-r from-zbc-blue to-[#1447e6] py-20 md:py-24">
        <div className="mx-auto container px-4 text-center">
          <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">Join Our Mission</h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-[1.6] text-[#dbeafe] md:text-xl">
            We&apos;re always looking for talented journalists, editors, and technologists who share our commitment to
            quality journalism.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded px-8 text-base font-bold text-zbc-blue bg-white"
            >
              View Open Positions
            </button>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded border-2 border-white px-8 text-base font-bold text-white"
            >
              Download Press Kit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
