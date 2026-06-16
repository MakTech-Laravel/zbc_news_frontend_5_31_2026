import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { TrendingTag } from "@/data/dummy/types";
import { fetchTrendingTags } from "@/services/frontend/trendingTags";
import { cn } from "@/lib/utils";

type PopularTopicsProps = {
  className?: string;
};

export function PopularTopics({ className }: PopularTopicsProps) {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchTrendingTags()
      .then((items) => {
        if (!isMounted) return;
        setTags(items.slice(0, 9));
      })
      .catch(() => {
        if (!isMounted) return;
        setTags([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      className={cn(
        "mt-4 w-full rounded-[14px] border border-border-light bg-white p-6",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-inter text-base font-medium leading-8 text-ink-heading">
        Popular Topics
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {loading ? (
          <p className="col-span-3 text-sm text-admin-label">Loading topics…</p>
        ) : tags.length === 0 ? (
          <p className="col-span-3 text-sm text-admin-label">No trending topics yet.</p>
        ) : (
          tags.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="rounded-lg bg-zbc-gray-200 px-1.5 py-0.5 text-center font-inter text-sm font-semibold leading-8 text-zbc-gray-1000 transition-colors hover:bg-zbc-gray-300"
            >
              {item.label.replace(/^#/, "")}
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
