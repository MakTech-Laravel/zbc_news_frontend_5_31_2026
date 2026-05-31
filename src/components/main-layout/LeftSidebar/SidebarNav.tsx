import { Link } from "react-router-dom";
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

import { sidebarNavItems } from "@/data/dummy/sidebar";

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
  newsletters: Mail,
  feedback: MessageSquare,
};

export function SidebarNav() {
  return (
    <nav aria-label="Quick links" className="space-y-0.5">
      {sidebarNavItems.map((item) => {
        const Icon = iconMap[item.icon] ?? Newspaper;

        return (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 font-general-sans text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <div className=" border border-border-light rounded-sm p-1.5">
              <Icon className="size-6 shrink-0 text-zbc-gray-700" aria-hidden />
            </div>
            <span className="font-general-sans text-[22px] font-semibold text-[#333333]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
