import { Link } from "react-router-dom";

import { trendingTags } from "@/data/dummy/sidebar";
import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import { TrendingUp } from "lucide-react";

export function TrendingNowCard() {
  return (
    <SidebarCard className="bg-white rounded-xs p-0!">
      <div className="flex items-center gap-2 border-b-2 border-border pb-3 mb-3 p-4">
        <TrendingUp className="size-5 text-[#E7000B]" />
        <h2 className="font-inter text-sm font-bold text-zbc-gray-1000">Trending Now</h2>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {trendingTags.map((tag) => (
          <Link
            key={tag.id}
            to={tag.href}
            className="font-inter text-xs font-semibold leading-snug text-zbc-gray-1000 hover:text-primary bg-muted px-3 py-1.5 rounded-full"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </SidebarCard>
  );
}
