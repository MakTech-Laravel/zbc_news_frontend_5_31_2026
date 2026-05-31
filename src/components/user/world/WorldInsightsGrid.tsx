import { WorldGlobalSpotlight } from "@/components/user/world/WorldGlobalSpotlight";
import { WorldMostReadToday } from "@/components/user/world/WorldMostReadToday";
import { WorldTopStoriesByRegion } from "@/components/user/world/WorldTopStoriesByRegion";
import type { WorldRegionId } from "@/data/dummy/worldNews";
import { cn } from "@/lib/utils";

type WorldInsightsGridProps = {
  className?: string;
  onRegionSelect?: (regionId: WorldRegionId) => void;
};

export function WorldInsightsGrid({ className, onRegionSelect }: WorldInsightsGridProps) {
  const handleRegionClick = (regionId: string) => {
    onRegionSelect?.(regionId as WorldRegionId);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      <WorldTopStoriesByRegion onRegionSelect={handleRegionClick} />
      <WorldMostReadToday />
      <WorldGlobalSpotlight className="md:col-span-2 xl:col-span-1" />
    </div>
  );
}
