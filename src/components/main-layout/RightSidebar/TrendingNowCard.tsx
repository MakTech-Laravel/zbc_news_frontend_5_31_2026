import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import type { TrendingTag } from "@/data/dummy/types";
import { fetchTrendingTags } from "@/services/frontend/trendingTags";

export function TrendingNowCard() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchTrendingTags()
      .then((data) => {
        if (!cancelled) {
          setTags(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch trending tags:", error);
        if (!cancelled) {
          setTags([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xs bg-muted" />;
  }

  return (
    <SidebarCard className="rounded-xs bg-white p-0!">
      <div className="mb-3 flex items-center gap-2 border-b-2 border-border p-4 pb-3">
        <TrendingUp className="size-5 text-[#E7000B]" />
        <h2 className="font-inter text-sm font-bold text-zbc-gray-1000">Trending Now</h2>
      </div>
      {tags.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground">No trending tags right now.</p>
      ) : (
        <div className="flex flex-wrap gap-2 p-4">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={tag.href}
              className="rounded-full bg-muted px-3 py-1.5 font-inter text-xs font-semibold leading-snug text-zbc-gray-1000 hover:text-primary"
            >
              {tag.label}
            </Link>
          ))}
        </div>
      )}
    </SidebarCard>
  );
}
