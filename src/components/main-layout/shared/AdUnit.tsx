import { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { cn } from "@/lib/utils";
import { trackAdEvent } from "@/lib/adTracking";
import { loadAdSenseScript, pushAdSenseUnit } from "@/lib/adsense";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { fetchPublicAdSlots, type PublicAdSlot } from "@/services/frontend/ads";

type AdUnitProps = {
  variant?: "banner" | "square" | "sidebar";
  slotKey?: string;
  className?: string;
};

export function AdUnit({ variant = "banner", slotKey, className }: AdUnitProps) {
  const { settings } = useSiteSettings();
  const [slot, setSlot] = useState<PublicAdSlot | null>(null);
  const impressionTracked = useRef(false);
  const googlePushed = useRef(false);
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!slotKey) return;

    let isMounted = true;
    impressionTracked.current = false;
    googlePushed.current = false;
    setSlot(null);

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

  // Common publisher ID (site-wide) + individual ad unit ID (per placement).
  const clientId =
    settings.googleAdsenseClient.trim() || (slot?.google_ad_client?.trim() ?? "");
  const adSlotId = slot?.google_ad_slot?.trim() ?? "";
  const isGoogle =
    slot?.provider === "google" && Boolean(clientId) && Boolean(adSlotId);

  useEffect(() => {
    if (!isGoogle) return;

    // New client/unit must be allowed to push again (settings can load after the slot).
    googlePushed.current = false;
    let cancelled = false;

    const fill = () => {
      if (cancelled || googlePushed.current) return;
      const el = insRef.current;
      if (!el) return;
      if (el.getAttribute("data-adsbygoogle-status")) {
        googlePushed.current = true;
        return;
      }
      googlePushed.current = true;
      pushAdSenseUnit();
    };

    void loadAdSenseScript(clientId)
      .then(() => {
        if (cancelled) return;
        // Double rAF: wait until <ins> from this render is committed.
        requestAnimationFrame(() => requestAnimationFrame(fill));
      })
      .catch(() => {
        // Script blocked / failed — leave empty container.
      });

    return () => {
      cancelled = true;
    };
  }, [isGoogle, clientId, adSlotId, slotKey]);

  const imageUrl = slot?.manual_image_url ? resolveMediaUrl(slot.manual_image_url) : "";
  const hasManualImage = Boolean(slot?.provider === "manual" && imageUrl);

  const handleClick = () => {
    if (!slotKey) return;
    void trackAdEvent(slotKey, "click");
  };

  const sizeClass =
    variant === "banner"
      ? "min-h-[120px] w-full"
      : variant === "square"
        ? "aspect-[4/3] w-full max-h-[360px] lg:max-h-none lg:aspect-square"
        : "min-h-[180px] w-full";

  if (isGoogle) {
    return (
      <div
        role="presentation"
        aria-label="Advertisement"
        className={cn(
          "flex w-full items-center justify-center overflow-hidden rounded-xs bg-muted/30",
          sizeClass,
          className,
        )}
      >
        <ins
          ref={insRef}
          key={`${clientId}-${adSlotId}-${slotKey}`}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={clientId}
          data-ad-slot={adSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

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
