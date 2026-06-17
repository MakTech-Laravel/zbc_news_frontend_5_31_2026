import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";

import {
  CAREERS_POSITIONS_SECTION,
  DEPARTMENT_FILTERS,
  JOB_LISTINGS,
  TYPE_FILTERS,
  type DepartmentFilter,
  type TypeFilter,
} from "@/components/careers/careersData";
import { cn } from "@/lib/utils";

export function CareersOpenPositions() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<DepartmentFilter>("All");
  const [type, setType] = useState<TypeFilter>("All Types");

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return JOB_LISTINGS.filter((job) => {
      const matchesDepartment = department === "All" || job.department === department;
      const matchesType = type === "All Types" || job.type === type;
      const matchesSearch =
        !query ||
        [job.title, job.department, job.location, job.type].some((value) =>
          value.toLowerCase().includes(query),
        );

      return matchesDepartment && matchesType && matchesSearch;
    });
  }, [department, search, type]);

  return (
    <section id="open-positions" className="py-20 md:py-24">
      <div className="mx-auto container px-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zbc-red-accent">
            {CAREERS_POSITIONS_SECTION.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            {CAREERS_POSITIONS_SECTION.heading}
          </h2>
        </header>

        <div className="mt-8">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-admin-label"
              strokeWidth={2}
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={CAREERS_POSITIONS_SECTION.searchPlaceholder}
              className="h-12 w-full rounded-lg border border-zbc-gray-200 bg-white pl-12 pr-4 text-base text-zbc-gray-1000 placeholder:text-admin-label focus-visible:border-zbc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue/20"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-admin-label">Dept:</span>
            {DEPARTMENT_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDepartment(option)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  department === option
                    ? "border-zbc-blue bg-zbc-blue text-white"
                    : "border-zbc-gray-200 bg-white text-admin-label hover:border-zbc-blue/40",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-admin-label">Type:</span>
            {TYPE_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  type === option
                    ? "border-zbc-blue bg-zbc-blue text-white"
                    : "border-zbc-gray-200 bg-white text-admin-label hover:border-zbc-blue/40",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 divide-y divide-zbc-gray-200 rounded-lg border border-zbc-gray-200 bg-white">
          {filteredJobs.length === 0 ? (
            <p className="px-6 py-10 text-center text-base text-admin-label">
              No roles match your search. Try adjusting filters or keywords.
            </p>
          ) : (
            filteredJobs.map((job) => (
              <article
                key={job.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-zbc-gray-1000">{job.title}</h3>
                    <span className="rounded bg-zbc-blue-light px-2.5 py-1 text-xs font-semibold text-zbc-blue-deep">
                      {job.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-zbc-blue">{job.department}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-admin-label">
                    <MapPin className="size-4 shrink-0" strokeWidth={2} />
                    {job.location}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-bold text-zbc-blue transition-colors hover:text-zbc-blue-deep sm:self-center"
                >
                  Apply
                  <ArrowRight className="size-4" strokeWidth={2.5} />
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
