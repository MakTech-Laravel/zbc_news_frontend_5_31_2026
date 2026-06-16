import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { trackAdEvent } from "@/lib/adTracking";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { fetchPublicAdSlots, type PublicAdSlot } from "@/services/frontend/ads";

type AdUnitProps = {
  variant?: "banner" | "square" | "sidebar";
  slotKey?: string;
  className?: string;
};

export function AdUnit({ variant = "banner", slotKey, className }: AdUnitProps) {
  const [slot, setSlot] = useState<PublicAdSlot | null>(null);
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (!slotKey) return;

    let isMounted = true;
    fetchPublicAdSlots()
      .then((map) => {
        if (!isMounted) return;
        setSlot(map[slotKey] ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setSlot(null);
      });

    return () => {
      isMounted = false;
    };
  }, [slotKey]);

  useEffect(() => {
    if (!slotKey || !slot || impressionTracked.current) return;
    impressionTracked.current = true;
    void trackAdEvent(slotKey, "impression");
  }, [slot, slotKey]);

  const imageUrl = slot?.manual_image_url ? resolveMediaUrl(slot.manual_image_url) : "";
  const hasManualImage = Boolean(slot?.provider === "manual" && imageUrl);

  const handleClick = () => {
    if (!slotKey) return;
    void trackAdEvent(slotKey, "click");
  };

  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-xs border-3 border-dashed bg-muted font-inter text-xs font-semibold text-muted-foreground",
        variant === "banner" && "h-[120px] w-full",
        variant === "square" &&
          "aspect-[4/3] w-full max-h-[360px] lg:max-h-none lg:aspect-square",
        variant === "sidebar" && "h-[180px] w-full",
        hasManualImage && "border-none bg-transparent p-0",
        className,
      )}
    >
      {hasManualImage ? (
        <a
          href={slot?.manual_click_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block h-full w-full overflow-hidden rounded-xs"
        >
          <img
            src={imageUrl}
            alt="Advertisement"
            className="h-full w-full object-cover"
          />
        </a>
      ) : (
        <div>
          <p className="font-inter text-xs font-semibold text-muted-foreground">Advertisement</p>
          <p className="font-inter text-xs font-normal text-muted-foreground">
            {slotKey ? `Slot: ${slotKey}` : "Sidebar Ad 1"}
          </p>
        </div>
      )}
    </div>
  );
}
