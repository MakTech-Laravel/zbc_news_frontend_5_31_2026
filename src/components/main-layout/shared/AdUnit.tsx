import { useEffect, useMemo, useRef, useState } from "react";
import { useCookieConsent } from "@/context/CookieConsentProvider";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { cn } from "@/lib/utils";
import { trackAdEvent } from "@/lib/adTracking";
import { loadAdSenseScript, pushAdSenseUnit } from "@/lib/adsense";
import { buildManualAdSrcDoc, hasManualAdHtml } from "@/lib/manualAdHtml";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { fetchPublicAdSlots, type PublicAdSlot } from "@/services/frontend/ads";

type AdUnitProps = {
  variant?: "banner" | "square" | "sidebar";
  slotKey?: string;
  className?: string;
};

function ManualHtmlEmbed({ html, title }: { html: string; title: string }) {
  const srcDoc = useMemo(() => buildManualAdSrcDoc(html), [html]);

  return (
    <iframe
      title={title}
      srcDoc={srcDoc}
      // allow-same-origin is required for nested embeds (YouTube, many ad networks).
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      className="block h-full w-full border-0 bg-transparent"
    />
  );
}

export function AdUnit({ variant = "banner", slotKey, className }: AdUnitProps) {
  const { settings } = useSiteSettings();
  const { ready: consentReady, allowAdvertising } = useCookieConsent();
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
    if (slot.provider === "google" && !allowAdvertising) return;
    impressionTracked.current = true;
    void trackAdEvent(slotKey, "impression");
  }, [slot, slotKey, allowAdvertising]);

  const clientId =
    settings.googleAdsenseClient.trim() || (slot?.google_ad_client?.trim() ?? "");
  const adSlotId = slot?.google_ad_slot?.trim() ?? "";
  const isGoogle =
    consentReady &&
    allowAdvertising &&
    slot?.provider === "google" &&
    Boolean(clientId) &&
    Boolean(adSlotId);

  useEffect(() => {
    if (!isGoogle) return;

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
  const manualHtml = slot?.manual_html?.trim() ?? "";
  const isManual = slot?.provider === "manual";
  const hasHtml = Boolean(isManual && hasManualAdHtml(manualHtml));
  const hasManualImage = Boolean(isManual && imageUrl && !hasHtml);

  const handleClick = () => {
    if (!slotKey) return;
    void trackAdEvent(slotKey, "click");
  };

  const sizeClass =
    variant === "banner"
      ? "min-h-[120px] h-[120px] w-full"
      : variant === "square"
        ? "aspect-[4/3] w-full max-h-[360px] lg:max-h-none lg:aspect-square"
        : "min-h-[180px] h-[250px] w-full";

  const shellClass = cn(
    "w-full overflow-auto rounded-xs",
    sizeClass,
    className,
  );

  if (isGoogle) {
    return (
      <div
        role="presentation"
        aria-label="Advertisement"
        className={cn(
          "flex items-center justify-center overflow-hidden bg-muted/30",
          shellClass,
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

  // Google slots stay empty until advertising cookies are accepted.
  if (slot?.provider === "google") {
    return (
      <div
        role="presentation"
        aria-label="Advertisement"
        className={cn("bg-muted/20", shellClass)}
      />
    );
  }

  if (hasHtml) {
    return (
      <div
        role="presentation"
        aria-label="Advertisement"
        className={cn("bg-transparent", shellClass)}
      >
        <ManualHtmlEmbed
          html={manualHtml}
          title={slotKey ? `Advertisement ${slotKey}` : "Advertisement"}
        />
      </div>
    );
  }

  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "flex items-center justify-center border-3 border-dashed bg-muted font-inter text-xs font-semibold text-muted-foreground",
        variant === "banner" && "h-[120px] w-full",
        variant === "square" &&
        "aspect-[4/3] w-full max-h-[360px] lg:max-h-none lg:aspect-square",
        variant === "sidebar" && "h-[180px] w-full",
        hasManualImage && "overflow-auto border-none bg-transparent p-0",
        className,
      )}
    >
      {hasManualImage ? (
        <a
          href={slot?.manual_click_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block h-full w-full overflow-auto rounded-xs"
        >
          <img
            src={imageUrl}
            alt="Advertisement"
            className="mx-auto block h-auto max-w-none object-contain"
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
