import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BarChart3, Clock, LogIn, LogOut, Menu, Radio, Search, Settings, Star, TrendingUp, User, X, Zap } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { UserNotificationsDropdown } from "@/components/user/shared/UserNotificationsDropdown";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPublishDate } from "@/lib/publishDate";
import { request } from "@/api/request";
import { fetchQuickLinks, type QuickLink } from "@/services/frontend/navigation";

type NavItem = { id: string; label: string; to: string };

// const STATIC_NAV: NavItem[] = [
//   { label: "Latest News", to: "/" },
// ];

export function useMainNav() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNavItems = async () => {
    try {
      setLoading(true);
      const response = await request.get("/categories");
      const categories = response.data.data;

      const dynamic: NavItem[] = categories
        .filter((cat: any) => cat.status === "active")
        .map((cat: any) => ({
          id: String(cat.id),
          label: cat.title,
          to: cat.slug ? `/${cat.slug}` : "/",
        }));

      setNavItems(dynamic);
    } catch (error) {
      console.error("Failed to fetch nav categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavItems();
  }, []);

  return { navItems, loading };
}

const QUICK_LINK_FALLBACK = [
  { id: 1, label: "Trending", url: "/", icon: "TrendingUp" },
  { id: 2, label: "Most Read", url: "/", icon: "BarChart3" },
  { id: 3, label: "Live Updates", url: "/", icon: "Radio" },
  { id: 4, label: "Editorial Picks", url: "/", icon: "Star" },
] as const;

const quickLinkIconMap: Record<string, typeof TrendingUp> = {
  TrendingUp,
  BarChart3,
  Radio,
  Star,
};

function useQuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetchQuickLinks()
      .then((items) => {
        if (!isMounted) return;
        setLinks(items.length > 0 ? items : [...QUICK_LINK_FALLBACK]);
      })
      .catch(() => {
        if (!isMounted) return;
        setLinks([...QUICK_LINK_FALLBACK]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return links;
}

// const BREAKING_ITEMS = [
//   {
//     headline: "Climate Accord in Brussels — Statement Expected 14:00 CET",
//     time: "9:28 AM",
//   },
//   {
//     headline:
//       "Dow Jones surges 847 points as Federal Reserve signals rate pause through Q3 2026",
//     time: "9:12 AM",
//   },
//   {
//     headline: "Ceasefire negotiations resume in Geneva as UN envoy arrives",
//     time: "8:55 AM",
//   },
//   {
//     headline: "Tech giants announce joint AI safety framework ahead of summit",
//     time: "8:41 AM",
//   },
// ];

const FALLBACK_LOGO = "/images/home/logo.png";

function BrandLogo({ compact }: { compact?: boolean }) {
  const { settings } = useSiteSettings();
  const logoSrc = settings.siteLogo ?? FALLBACK_LOGO;
  const siteName = settings.siteName || "ZBC News";

  return (
    <Link
      to="/"
      className={cn(
        "inline-flex shrink-0 items-center",
        compact ? "min-w-0 max-w-[150px] sm:max-w-[180px]" : "max-w-[220px] xl:max-w-[260px]",
      )}
      aria-label={`${siteName} home`}
    >
      <img
        src={logoSrc}
        alt={`${siteName} Logo`}
        className={cn(
          "block h-auto w-full object-contain",
          compact ? "max-h-8 sm:max-h-10" : "max-h-10 lg:max-h-12 xl:max-h-14",
        )}
      />
    </Link>
  );
}

function BreakingNewsTicker() {

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const response = await request.get("/articles/breaking");
        setItems(response.data.data);
      } catch (error) {
        console.error("Failed to fetch breaking news:", error);
      }
    };

    fetchBreakingNews();
  }, []);

  const tickerItems = items.length > 0 ? [...items, ...items] : items;

  return (
    <div className="bg-zbc-breaking text-primary-foreground" aria-label="Breaking news">
      <div className="mx-auto flex h-9 w-full container items-center gap-2.5 overflow-hidden px-4 sm:gap-3">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-zbc-breaking-dark px-2 py-[3px] font-sans text-[12px] font-bold uppercase leading-none tracking-[0.06em] sm:text-[11px]">
          <Zap className="size-3 fill-current sm:size-3.5" aria-hidden />
          <p className="font-bold text-white text-xs">Breaking</p>
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden" aria-live="polite">
          <div
            className="flex w-max items-center gap-5 whitespace-nowrap font-sans text-[12px] leading-none motion-reduce:animate-none sm:gap-6 sm:text-[13px]"
            style={{ animation: "news-ticker 10s linear infinite" }}
          >
            {tickerItems.map((item, index) => (
              <span
                key={`${item.title}-${index}`}
                className="inline-flex items-center gap-2"
              >
                <span>{item.title}</span>
                <span className="text-white/60" aria-hidden>
                  •
                </span>
                <span className="font-medium text-white/90">
                  {formatPublishDate(item.published_at ?? item.created_at).time ||
                    item.created_at}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchField({
  className,
  onOpen,
}: {
  className?: string;
  onOpen: () => void;
}) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zbc-gray-400"
        aria-hidden
      />
      <Input
        type="search"
        readOnly
        placeholder="Search news, topics..."
        onClick={onOpen}
        onFocus={onOpen}
        className="h-10 w-full cursor-pointer rounded-full border-border bg-muted pl-10 font-sans text-[13px] text-foreground shadow-none placeholder:text-zbc-gray-400 focus-visible:border-zbc-gray-200 focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label="Open search"
      />
    </div>
  );
}

function AccountActions({ showLabel = true }: { showLabel?: boolean }) {
  const { isAuthenticated, isUserLoading, logout, user } = useAuth();
  const showAuthenticated = isAuthenticated && !isUserLoading;

  if (!showAuthenticated) {
    return (
      <Button
        asChild
        type="button"
        variant="outline"
        className="h-9 gap-2 rounded-lg border-border bg-muted px-3 font-sans text-[13px] font-medium text-zbc-gray-700 shadow-none hover:bg-zbc-gray-200"
      >
        <Link to="/login">
          <User className="size-4 shrink-0" aria-hidden />
          {showLabel ? (
            <span className="hidden sm:inline">My Account</span>
          ) : (
            <span className="sr-only">My Account</span>
          )}
        </Link>
      </Button>
    );
  }

  const initials =
    (user?.name ?? user?.email ?? "U")
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <UserNotificationsDropdown className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 rounded-lg border-border bg-muted px-3 pl-2 font-sans text-[13px] font-medium text-zbc-gray-700 shadow-none hover:bg-zbc-gray-200"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-sans text-[11px] font-bold text-primary-foreground">
              {initials}
            </span>
            {showLabel ? (
              <span className="hidden max-w-[7rem] truncate sm:inline">
                {user?.name ?? "My Account"}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <Settings className="size-4" aria-hidden />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              void logout();
            }}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LiveDateTime() {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setFormatted(
        now
          .toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
            timeZone: "America/New_York",
          })
          .replace(" at ", " • "),
      );
    }
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hidden shrink-0 items-center gap-1.5 font-sans text-[12px] text-muted-foreground xl:flex">
      <Clock className="size-3.5 shrink-0" aria-hidden />
      <time dateTime={new Date().toISOString()}>{formatted || "—"}</time>
    </div>
  );
}

function MainNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { navItems } = useMainNav();
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.to}
          end={item.to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "relative shrink-0 whitespace-nowrap px-2.5 py-3 font-inter text-base font-normal sm:font-bold transition-colors sm:px-3 sm:text-xl",
              isActive
                ? "text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-primary"
                : "text-zbc-gray-700 hover:text-primary",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

/** Desktop + tablet horizontal nav (Figma row 2) */
function MainNavBar() {
  return (
    <nav
      className="block border-t border-border"
      aria-label="Main navigation"
    >
      <div
        className="mx-auto flex w-full container items-center justify-start gap-0 overflow-x-auto px-4 py-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <MainNavLinks />
      </div>
    </nav>
  );
}

/** Sub-nav + datetime (Figma row 3) */
function SubNavBar() {
  const quickLinks = useQuickLinks();

  return (
    <div
      className="mx-auto container hidden border-t border-border bg-zbc-gray-100 md:block mt-2 p-4"
      aria-label="Quick links"
    >
      <div
        className="mx-auto flex min-h-[42px] w-full container items-center justify-between gap-3 px-4 py-2"
      >
        <nav
          className={cn(
            "flex flex-1 items-center gap-3 overflow-x-auto sm:gap-4",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {quickLinks.map(({ id, label, url, icon }) => {
            const Icon = icon ? (quickLinkIconMap[icon] ?? TrendingUp) : TrendingUp;
            return (
            <Link
              key={id}
              to={url || "/"}
              className="inline-flex shrink-0 items-center gap-1.5 font-inter text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {label}
            </Link>
            );
          })}
        </nav>
        <LiveDateTime />
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { navItems } = useMainNav();
  const quickLinks = useQuickLinks();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="size-9 shrink-0 rounded-lg p-0 text-foreground bg-zbc-gray-100 hover:bg-muted md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPortal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[100] bg-black/50",
            "data-[state=open]:mobile-menu-overlay-in data-[state=closed]:mobile-menu-overlay-out",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-[101] flex w-[min(calc(100vw-3rem),20rem)] flex-col bg-background shadow-2xl outline-none",
            "border-r border-border will-change-transform",
            "data-[state=open]:mobile-menu-drawer-in data-[state=closed]:mobile-menu-drawer-out",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <DialogTitle className="font-heading text-base font-semibold text-foreground">
              Menu
            </DialogTitle>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg bg-zbc-gray-100 hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </DialogClose>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to === "/" && location.pathname === "/");
                return (
                  <DialogClose asChild key={item.id}>
                    <Link
                      to={item.to}
                      className={cn(
                        "rounded-lg px-3 py-2.5 font-sans text-[14px] font-medium transition-colors",
                        isActive
                          ? "bg-accent text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {item.label}
                    </Link>
                  </DialogClose>
                );
              })}
            </nav>

            <nav
              className="flex flex-col gap-0.5 border-t border-border pt-3"
              aria-label="Quick links"
            >
              {quickLinks.map(({ id, label, url, icon }) => {
                const Icon = icon ? (quickLinkIconMap[icon] ?? TrendingUp) : TrendingUp;
                return (
                  <DialogClose asChild key={id}>
                    <Link
                      to={url || "/"}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="size-4" aria-hidden />
                      {label}
                    </Link>
                  </DialogClose>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 border-t border-border pt-3 font-sans text-[12px] text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              <LiveDateTimeMobile />
            </div>

            <div className="border-t border-border pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] uppercase tracking-wide text-zbc-gray-400">
                      Signed in as {user?.email ?? user?.name}
                    </p>
                    <UserNotificationsDropdown className="rounded-full text-muted-foreground hover:bg-muted" />
                  </div>
                  <DialogClose asChild>
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                      <Link to="/dashboard">
                        <Settings className="size-4" />
                        Dashboard
                      </Link>
                    </Button>
                  </DialogClose>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <DialogClose asChild>
                  <Button asChild variant="outline" className="h-11 w-full gap-2">
                    <Link to="/login">
                      <LogIn className="size-4" />
                      My Account
                    </Link>
                  </Button>
                </DialogClose>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function LiveDateTimeMobile() {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setFormatted(
        now
          .toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
            timeZone: "America/New_York",
          })
          .replace(" at ", " • "),
      );
    }
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return <time dateTime={new Date().toISOString()}>{formatted || "—"}</time>;
}

export function FrontendHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background shadow-sm [--header-mobile-offset:9rem] md:[--header-mobile-offset:10.5rem]"
      id="site-header"
    >
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <BreakingNewsTicker />

      {/* Row 1: logo · search · actions */}
      <div className="relative mx-auto w-full container bg-background px-4">
        <div className="flex items-center justify-between gap-2 py-3 sm:gap-3 sm:py-3.5 lg:py-4">
        <MobileMenu />
          <div className="min-w-0 lg:hidden">
            <BrandLogo compact />
          </div>
          <div className="hidden lg:block">
            <BrandLogo />
          </div>


          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div className="hidden min-w-0 flex-1 md:mx-4 md:block lg:mx-6">
            <SearchField className="mx-auto max-w-2xl" onOpen={() => setSearchOpen(true)} />
          </div>
            <div className="hidden md:flex">
              <AccountActions />
            </div>
            <div className="flex md:hidden">
              <AccountActions showLabel={false} />
            </div>
            
          </div>
        </div>

        {/* Mobile search below logo row */}
        <div className="mb-2 p-0 md:p-3 md:hidden">
          <SearchField onOpen={() => setSearchOpen(true)} />
        </div>
      </div>

      <MainNavBar />
      <SubNavBar />
    </header>
  );
}
