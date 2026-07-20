import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Cloud,
  Gamepad2,
  Heart,
  Mail,
  MessageSquare,
  Newspaper,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  fetchMenuByLocation,
  mapMenuItemsToNav,
  MENU_LOCATION,
  type NavItem,
} from "@/services/frontend/navigation";

const iconMap: Record<string, LucideIcon> = {
  finance: Wallet,
  sports: Trophy,
  mail: Mail,
  search: Search,
  weather: Cloud,
  games: Gamepad2,
  shopping: ShoppingBag,
  health: Heart,
  creators: Sparkles,
  entertainment: Newspaper,
  technology: TrendingUp,
  trendingup: TrendingUp,
  newsletters: Mail,
  feedback: MessageSquare,
  newspaper: Newspaper,
};

function resolveIcon(item: NavItem): LucideIcon {
  const raw = (item.icon ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (raw && iconMap[raw]) return iconMap[raw];

  const slug = item.to.replace(/^\//, "").split("/")[0]?.toLowerCase() ?? "";
  if (slug && iconMap[slug]) return iconMap[slug];

  return Newspaper;
}

function isExternal(item: Pick<NavItem, "to" | "target">) {
  if (item.target === "_blank") return true;
  return /^(https?:|mailto:|tel:)/i.test(item.to);
}

export function SidebarNav() {
  const location = useLocation();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchMenuByLocation(MENU_LOCATION.sidebar)
      .then((menu) => {
        if (!isMounted) return;
        // Top-level items from Admin → Menus → Sidebar location.
        setItems(mapMenuItemsToNav(menu?.items ?? []));
      })
      .catch(() => {
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && items.length === 0) {
    return (
      <nav aria-label="Sidebar menu" className="space-y-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5"
          >
            <div className="size-9 animate-pulse rounded-sm bg-muted" />
            <div className="h-5 flex-1 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </nav>
    );
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label="Sidebar menu" className="space-y-0.5">
      {items.map((item) => {
        const Icon = resolveIcon(item);
        const active =
          !isExternal(item) &&
          (location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(`${item.to}/`)));

        const className = cn(
          "flex items-center gap-3 rounded-lg px-2 py-2.5 font-general-sans text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          active && "bg-muted text-foreground",
        );

        const content = (
          <>
            <div className="rounded-sm border border-border-light p-1.5">
              <Icon className="size-6 shrink-0 text-zbc-gray-700" aria-hidden />
            </div>
            <span className="font-general-sans text-[22px] font-semibold text-[#333333]">
              {item.label}
            </span>
          </>
        );

        if (isExternal(item)) {
          return (
            <a
              key={item.id}
              href={item.to}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {content}
            </a>
          );
        }

        return (
          <Link key={item.id} to={item.to} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
