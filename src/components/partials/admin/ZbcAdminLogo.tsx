import { Link } from "react-router-dom";

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
  "aria-label": ariaLabel = "ZBC News home",
}: ZbcAdminLogoProps) {
  if (collapsed) {
    return (
      <Link
        to={to}
        className={cn("inline-flex", className)}
        aria-label={ariaLabel}
      >
        <span className="flex size-9 items-center justify-center rounded-md bg-zbc-blue text-xs font-bold">
          ZB
        </span>
      </Link>
    );
  }

  return (
    <Link to={to} className={cn("inline-block py-2", className)} aria-label={ariaLabel}>
      <span className="font-sans text-[2rem] font-black leading-9 tracking-[-0.75px]">
        <span className="text-zbc-blue">ZBC N</span>
        <span className="text-zbc-breaking">EWS</span>
      </span>
    </Link>
  );
}
