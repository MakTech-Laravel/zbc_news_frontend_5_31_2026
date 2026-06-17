import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CAREERS_FAQ_SECTION, FAQ_ITEMS } from "@/components/careers/careersData";
import { cn } from "@/lib/utils";

export function CareersFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto container max-w-3xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zbc-red-accent">
            {CAREERS_FAQ_SECTION.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-zbc-gray-1000 md:text-4xl">
            {CAREERS_FAQ_SECTION.heading}
          </h2>
        </div>

        <div className="mt-12 divide-y divide-zbc-gray-200 rounded-lg border border-zbc-gray-200 bg-white">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-zbc-gray-1000">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-admin-label transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    strokeWidth={2}
                  />
                </button>
                {isOpen ? (
                  <p className="px-6 pb-5 text-base leading-6.5 text-admin-label">{item.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
