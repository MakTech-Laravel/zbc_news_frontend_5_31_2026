import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BarChart3, Bell, Clock, LogIn, LogOut, Menu, Radio, Search, Settings, Star, TrendingUp, User, X, Zap } from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { request } from "@/api/request";

type NavItem = { label: string; to: string };

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
          label: cat.title,
          to: `/${cat.slug}`,
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

const SUB_NAV = [
  { label: "Trending", to: "/", icon: TrendingUp },
  { label: "Most Read", to: "/", icon: BarChart3 },
  { label: "Live Updates", to: "/", icon: Radio },
  { label: "Editorial Picks", to: "/", icon: Star },
] as const;

const BREAKING_ITEMS = [
  {
    headline: "Climate Accord in Brussels — Statement Expected 14:00 CET",
    time: "9:28 AM",
  },
  {
    headline:
      "Dow Jones surges 847 points as Federal Reserve signals rate pause through Q3 2026",
    time: "9:12 AM",
  },
  {
    headline: "Ceasefire negotiations resume in Geneva as UN envoy arrives",
    time: "8:55 AM",
  },
  {
    headline: "Tech giants announce joint AI safety framework ahead of summit",
    time: "8:41 AM",
  },
];

const logo = "/images/home/logo.png";

function BreakingNewsTicker() {
  const items = [...BREAKING_ITEMS, ...BREAKING_ITEMS];

  return (
    <div className="hidden bg-zbc-breaking text-primary-foreground md:block" aria-label="Breaking news">
      <div className="mx-auto flex h-9 w-full container items-center gap-2.5 overflow-hidden px-4 sm:gap-3">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-zbc-breaking-dark px-2 py-[3px] font-sans text-[12px] font-bold uppercase leading-none tracking-[0.06em] sm:text-[11px]">
          <Zap className="size-3 fill-current sm:size-3.5" aria-hidden />
          <p className="font-bold text-white text-xs">Breaking</p>
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden" aria-live="polite">
          <div
            className="flex w-max items-center gap-5 whitespace-nowrap font-sans text-[12px] leading-none motion-reduce:animate-none sm:gap-6 sm:text-[13px]"
            style={{ animation: "news-ticker 50s linear infinite" }}
          >
            {items.map((item, index) => (
              <span
                key={`${item.headline}-${index}`}
                className="inline-flex items-center gap-2"
              >
                <span>{item.headline}</span>
                <span className="text-white/60" aria-hidden>
                  •
                </span>
                <span className="font-medium text-white/90">{item.time}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandLogo({ compact }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn("inline-flex shrink-0 flex-col", compact && "min-w-0")}
      aria-label="ZBC News home"
    >
      <img src={logo} alt="ZBC News Logo" className="w-full h-full" />
    </Link>
  );
}

function SearchField({ className }: { className?: string }) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zbc-gray-400"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search news, topics..."
        className="h-10 w-full rounded-full border-border bg-muted pl-10 font-sans text-[13px] text-foreground shadow-none placeholder:text-zbc-gray-400 focus-visible:border-zbc-gray-200 focus-visible:ring-2 focus-visible:ring-primary/30"
      />
    </div>
  );
}

function NotificationButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-label="Notifications"
    >
      <Bell className="size-[18px] stroke-[1.75]" aria-hidden />
      <span className="absolute right-2 top-2 size-2 rounded-full bg-zbc-red ring-2 ring-background" />
    </button>
  );
}

function AccountActions({ showLabel = true }: { showLabel?: boolean }) {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <NotificationButton className="hidden md:block" />
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
      </div>
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
          key={item.to}
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
      className="hidden md:block border-t border-border"
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
          {SUB_NAV.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex shrink-0 items-center gap-1.5 font-inter text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <LiveDateTime />
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { navItems } = useMainNav();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    close();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">

    {!open && (
      <Button
        type="button"
        variant="ghost"
        className="size-9 shrink-0 rounded-lg p-0 text-foreground bg-zbc-gray-100 hover:bg-muted"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
    )}

      {open ? (
        <>
        <div className="fixed top-0 inset-x-0 z-[70] overflow-y-auto border-t border-border bg-background shadow-lg">
          {/* Close button — right side */}
          <div className="flex justify-end p-4 pb-0">
        <Button
          type="button"
          variant="ghost"
          className="size-9 shrink-0 rounded-lg p-0 text-foreground bg-zbc-gray-100 hover:bg-muted"
          aria-label="Close menu"
          onClick={close}
        >
          <X className="size-5" />
        </Button>
      </div>

            <div className="space-y-4 p-4">
              {/* <SearchField /> */}
              {/* <NotificationButton className="block md:hidden" /> */}
              

              <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.to === "/" && location.pathname === "/");
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={close}
                      className={cn(
                        "rounded-lg px-3 py-2.5 font-sans text-[14px] font-medium",
                        isActive
                          ? "bg-accent text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <nav
                className="flex flex-col gap-0.5 border-t border-border pt-3"
                aria-label="Quick links"
              >
                {SUB_NAV.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={close}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-1.5 border-t border-border pt-3 font-sans text-[12px] text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                <LiveDateTimeMobile />
              </div>

              <div className="border-t border-border pt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <p className="px-1 text-[11px] uppercase tracking-wide text-zbc-gray-400">
                      Signed in as {user?.email ?? user?.name}
                    </p>
                    <Button asChild variant="outline" className="w-full justify-start gap-2" onClick={close}>
                      <Link to="/dashboard">
                        <Settings className="size-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-destructive"
                      onClick={() => {
                        close();
                        void logout();
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button asChild variant="outline" className="h-11 w-full gap-2" onClick={close}>
                    <Link to="/login">
                      <LogIn className="size-4" />
                      My Account
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
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
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background shadow-sm [--header-mobile-offset:9rem] md:[--header-mobile-offset:10.5rem]"
      id="site-header"
    >
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
            <SearchField className="mx-auto max-w-2xl" />
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
          <SearchField />
        </div>
      </div>

      <MainNavBar />
      <SubNavBar />
    </header>
  );
}
