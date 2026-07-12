import { Link } from "react-router-dom";

import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";

type ZbcAdminLogoProps = {
  className?: string;
  to?: string;
  collapsed?: boolean;
  "aria-label"?: string;
};

export function ZbcAdminLogo({
  className,
  to = "/",
  collapsed = false,
  "aria-label": ariaLabel,
}: ZbcAdminLogoProps) {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || "ZBC News";
  const logoSrc = settings.siteLogo ? resolveMediaUrl(settings.siteLogo) : "";
  const label = ariaLabel ?? `${siteName} home`;

  if (logoSrc) {
    return (
      <Link to={to} className={cn("inline-flex items-center", className)} aria-label={label}>
        <img
          src={logoSrc}
          alt={siteName}
          className={cn(
            "block w-auto object-contain",
            collapsed ? "h-9 max-w-9" : "h-10 max-w-[180px]",
          )}
        />
      </Link>
    );
  }

  if (collapsed) {
    return (
      <Link to={to} className={cn("inline-flex", className)} aria-label={label}>
        <span className="flex size-9 items-center justify-center rounded-md bg-zbc-blue text-xs font-bold text-white">
          ZB
        </span>
      </Link>
    );
  }

  return (
    <Link to={to} className={cn("inline-block py-2", className)} aria-label={label}>
      <span className="font-sans text-[2rem] font-black leading-9 tracking-[-0.75px]">
        <span className="text-zbc-blue">ZBC N</span>
        <span className="text-zbc-breaking">EWS</span>
      </span>
    </Link>
  );
}
