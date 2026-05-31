import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type ZbcAdminLogoProps = {
  className?: string;
  to?: string;
  "aria-label"?: string;
};

export function ZbcAdminLogo({
  className,
  to = "/admin/dashboard",
  "aria-label": ariaLabel = "ZBC News admin home",
}: ZbcAdminLogoProps) {
  return (
    <Link to={to} className={cn("inline-block py-2", className)} aria-label={ariaLabel}>
      <span className="font-sans text-[2rem] font-black leading-9 tracking-[-0.75px]">
        <span className="text-zbc-blue">ZBC N</span>
        <span className="text-zbc-breaking">EWS</span>
      </span>
    </Link>
  );
}
