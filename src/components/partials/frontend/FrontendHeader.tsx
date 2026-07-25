import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  Clock,
  LogIn,
  LogOut,
  Menu,
  Radio,
  Search,
  Settings,
  Star,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { UserNotificationsDropdown } from "@/components/user/shared/UserNotificationsDropdown";
import { Input } from "@/components/ui/input";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { cn } from "@/lib/utils";
import { request } from "@/api/request";
import { fetchPublicBreakingNews, type LiveBreakingNewsItem } from "@/services/frontend/breakingNews";
import { keepLiveBreakingNewsItems } from "@/lib/breakingNews";
import {
  fetchMenuByLocation,
  fetchQuickLinks,
  mapMenuItemsToNav,
  MENU_LOCATION,
  withoutHomeNavItem,
  type NavItem,
  type QuickLink,
} from "@/services/frontend/navigation";

const HOME_NAV_ITEM: NavItem = { id: "home", label: "Home", to: "/" };

function isExternalNavTarget(item: Pick<NavItem, "to" | "target">) {
  if (item.target === "_blank") return true;
  return /^(https?:|mailto:|tel:)/i.test(item.to);
}

/**
 * Header nav from Admin → Menus locations:
 * - Middle bar: `header_primary`
 * - More mega dropdown: `mega_menu` (More button only when assigned)
 * - Mobile drawer: `header_mobile`, else primary (+ mega if set)
 */
export function useMainNav() {
  const [primaryItems, setPrimaryItems] = useState<NavItem[]>([]);
  const [megaItems, setMegaItems] = useState<NavItem[]>([]);
  const [mobileItems, setMobileItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [primaryMenu, megaMenu, mobileMenu] = await Promise.all([
          fetchMenuByLocation(MENU_LOCATION.headerPrimary),
          fetchMenuByLocation(MENU_LOCATION.megaMenu),
          fetchMenuByLocation(MENU_LOCATION.headerMobile),
        ]);

        if (!isMounted) return;

        const primary = withoutHomeNavItem(
          mapMenuItemsToNav(primaryMenu?.items ?? []),
        );
        const mega = withoutHomeNavItem(
          mapMenuItemsToNav(megaMenu?.items ?? []),
        );
        // Drawer uses Mobile Menu location only; fall back to primary if unset.
        const mobile = withoutHomeNavItem(
          mapMenuItemsToNav(mobileMenu?.items ?? []),
        );

        setPrimaryItems(primary);
        setMegaItems(mega);
        setMobileItems(mobile.length > 0 ? mobile : primary);
      } catch (error) {
        console.error("Failed to fetch header menus:", error);
        if (!isMounted) return;
        setPrimaryItems([]);
        setMegaItems([]);
        setMobileItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    homeItem: HOME_NAV_ITEM,
    /** Items between Home and More (`header_primary`) */
    primaryItems,
    /** Mega dropdown items (`mega_menu`); empty ⇒ hide More */
    megaItems,
    hasMegaMenu: megaItems.length > 0,
    /** Drawer links from `header_mobile` (falls back to primary) */
    mobileItems,
    loading,
  };
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

const FALLBACK_LOGO = "/images/home/logo.png";

function BrandLogo({ compact }: { compact?: boolean }) {
  const { settings } = useSiteSettings();
  const logoSrc = settings.siteLogo
    ? resolveMediaUrl(settings.siteLogo) || FALLBACK_LOGO
    : FALLBACK_LOGO;
  const siteName = settings.siteName || "ZBC News";

  return (
    <Link
      to="/"
      className={cn(
        "inline-flex shrink-0 items-center",
        compact
          ? "min-w-0 w-[220px] sm:w-[240px]"
          : "w-[240px] xl:w-[280px]",
      )}
      aria-label={`${siteName} home`}
    >
      <img
        src={logoSrc}
        alt={`${siteName} Logo`}
        className={cn(
          "block h-auto w-full object-contain",
          compact ? "h-12 sm:h-14" : "h-12 lg:h-14 xl:h-16",
        )}
      />
    </Link>
  );
}

function BreakingNewsTicker() {
  const [items, setItems] = useState<LiveBreakingNewsItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const liveItems = await fetchPublicBreakingNews(10);
        if (isMounted) setItems(liveItems);
      } catch (error) {
        console.error("Failed to fetch breaking news:", error);
        if (isMounted) setItems([]);
      }
    };

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 30_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const liveItems = keepLiveBreakingNewsItems(items, new Date(nowTick));

  if (liveItems.length === 0) return null;

  // One full pass of every headline, then seamless repeat (track = segment × 2).
  const durationSeconds = Math.max(22, liveItems.length * 7 + 12);

  const renderSegment = (keyPrefix: string, inert = false) => (
    <div
      key={keyPrefix}
      className="breaking-ticker-segment font-sans text-[13px] leading-none sm:text-[14px]"
      aria-hidden={inert || undefined}
    >
      {liveItems.map((item, index) => (
        <span key={`${keyPrefix}-${item.slug}-${index}`} className="inline-flex items-center gap-10">
          <Link
            to={`/${encodeURIComponent(item.slug)}`}
            tabIndex={inert ? -1 : undefined}
            className="text-white transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {item.title}
          </Link>
          {index < liveItems.length - 1 ? (
            <span className="text-white/50" aria-hidden>
              •
            </span>
          ) : null}
        </span>
      ))}
      {/* End-of-cycle separator before the list repeats */}
      <span className="text-white/50" aria-hidden>
        •
      </span>
    </div>
  );

  return (
    <div
      className="border-t border-zbc-gray-800 bg-zbc-breaking text-primary-foreground"
      aria-label="Breaking news"
    >
      <div className="mx-auto flex h-10 w-full container items-center gap-2.5 overflow-hidden px-4 sm:h-9 sm:gap-3">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-zbc-breaking-dark px-2.5 py-1 font-sans text-[11px] font-bold uppercase leading-none tracking-[0.08em] text-white sm:text-[12px]">
          <Zap className="size-3.5 fill-current" aria-hidden />
          Breaking
        </span>
        <div
          className="breaking-ticker-viewport relative min-w-0 flex-1"
          aria-live="polite"
        >
          <div
            className="breaking-ticker-track"
            style={{ animationDuration: `${durationSeconds}s` }}
          >
            {renderSegment("a")}
            {renderSegment("b", true)}
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
        className="h-9 gap-2 rounded-lg border-border bg-muted px-3 font-sans text-sm font-medium text-zbc-gray-700 shadow-none hover:bg-zbc-gray-200"
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
            className="h-9 gap-2 rounded-lg border-border bg-muted px-3 pl-2 font-sans text-sm font-medium text-zbc-gray-700 shadow-none hover:bg-zbc-gray-200"
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
  const [iso, setIso] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setIso(now.toISOString());
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
      <time dateTime={iso || undefined}>{formatted || "—"}</time>
    </div>
  );
}

function PrimaryNavItem({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const className = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative inline-flex shrink-0 items-center whitespace-nowrap px-2.5 py-3 font-sans text-sm font-medium transition-colors duration-200",
      isActive ? "text-primary" : "text-zbc-gray-700 hover:text-primary",
    );

  if (isExternalNavTarget(item)) {
    return (
      <a
        href={item.to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className({ isActive: false })}
      >
        {item.label}
      </a>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={className}
    >
      {item.label}
    </NavLink>
  );
}

function MoreMenuDropdown({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const renderedRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRafRef = useRef<number | null>(null);

  const MEGA_ENTER_MS = 320;
  const MEGA_EXIT_MS = 240;
  const HOVER_LEAVE_MS = 200;
  /** Fixed panel height; content scrolls inside. */
  const MEGA_PANEL_HEIGHT = 500;

  openRef.current = open;
  renderedRef.current = rendered;

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const logoEl = document.querySelector(
      "[data-header-logo-start]",
    ) as HTMLElement | null;
    const accountEl = document.querySelector(
      "[data-header-account-end]",
    ) as HTMLElement | null;

    const logoRect = logoEl?.getBoundingClientRect();
    const accountRect = accountEl?.getBoundingClientRect();

    // `display:none` elements report zero-size rects (common below lg).
    const logoVisible = Boolean(logoRect && logoRect.width > 0);
    const accountVisible = Boolean(accountRect && accountRect.width > 0);

    let boundsLeft: number;
    let boundsRight: number;

    if (logoVisible && accountVisible && logoRect && accountRect) {
      // Desktop (lg+): align panel between logo and account actions.
      boundsLeft = logoRect.left;
      boundsRight = accountRect.right;
    } else {
      // Tablet / mobile nav row: span the nav container, or viewport padding.
      const navContainer = triggerRef.current?.closest(
        ".container",
      ) as HTMLElement | null;
      const containerRect = navContainer?.getBoundingClientRect();

      if (containerRect && containerRect.width > 0) {
        boundsLeft = containerRect.left;
        boundsRight = containerRect.right;
      } else {
        const padding = 16;
        boundsLeft = padding;
        boundsRight = window.innerWidth - padding;
      }
    }

    const panelWidth = Math.max(boundsRight - boundsLeft, 0);

    // Align to trigger bottom; visual gap comes from pt bridge (keeps hover continuous).
    setCoords({
      top: rect.bottom,
      left: boundsLeft,
      width: panelWidth,
    });
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const clearOpenRaf = () => {
    if (openRafRef.current != null) {
      cancelAnimationFrame(openRafRef.current);
      openRafRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    // Already fully open — do not restart animation (stops hover jerk).
    if (openRef.current && renderedRef.current) {
      return;
    }

    // Closing mid-exit: reopen without remounting.
    if (renderedRef.current && !openRef.current) {
      clearOpenRaf();
      setOpen(true);
      return;
    }

    clearOpenRaf();
    updateCoords();
    setRendered(true);
    // Paint closed state first, then open once — single slide (no jump).
    openRafRef.current = requestAnimationFrame(() => {
      openRafRef.current = requestAnimationFrame(() => {
        setOpen(true);
        openRafRef.current = null;
      });
    });
  };

  const closeMenu = () => {
    clearCloseTimer();
    clearOpenRaf();
    setOpen(false);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setRendered(false);
      exitTimerRef.current = null;
    }, MEGA_EXIT_MS);
  };

  useEffect(() => {
    if (!rendered) return;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [rendered]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = document.getElementById("desktop-mega-menu");
      if (triggerRef.current?.contains(target) || panel?.contains(target)) {
        return;
      }
      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
      clearOpenRaf();
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  if (items.length === 0) return null;

  const handleEnter = () => {
    openMenu();
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => closeMenu(), HOVER_LEAVE_MS);
  };

  return (
    <div
      ref={triggerRef}
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className={cn(
          // Generous padding = stable hover hit area (no gap between label/icon)
          "relative flex min-h-11 shrink-0 items-center whitespace-nowrap px-3.5 py-3 font-sans text-sm font-medium transition-colors duration-200 ease-out",
          open ? "text-primary" : "text-zbc-gray-700 hover:text-primary",
        )}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          if (open) closeMenu();
          else openMenu();
        }}
      >
        <span className="pr-1.5">More</span>
        <ChevronDown
          className="pointer-events-none size-4 shrink-0 opacity-70"
          aria-hidden
        />
      </button>

      {/* Invisible bridge under the button so the cursor never falls into a dead zone
          between the trigger and the portaled mega panel. */}
      {(open || rendered) && (
        <div
          className="absolute inset-x-0 top-full z-[1] h-5"
          aria-hidden
        />
      )}

      {rendered && coords
        ? createPortal(
            <div
              id="desktop-mega-menu"
              // Outer shell stays still (hover bridge). Only the inner panel slides.
              className="fixed z-[200] pt-5"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <div
                className={cn(
                  "mega-menu-panel",
                  open && "mega-menu-panel-open",
                )}
                style={{
                  ["--mega-enter" as string]: `${MEGA_ENTER_MS}ms`,
                  ["--mega-exit" as string]: `${MEGA_EXIT_MS}ms`,
                }}
              >
                <div
                  className="overflow-y-auto overscroll-contain rounded-xl border border-border bg-background p-3 shadow-2xl sm:p-4"
                  style={{ height: MEGA_PANEL_HEIGHT }}
                >
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {items.map((item) => (
                      <div key={item.id} className="min-w-0">
                        {isExternalNavTarget(item) ? (
                          <a
                            href={item.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeMenu}
                            className="block truncate rounded-lg px-2.5 py-2 font-sans text-sm font-medium text-zbc-gray-700 transition-colors duration-150 hover:bg-muted hover:text-primary"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            to={item.to}
                            onClick={closeMenu}
                            className="block truncate rounded-lg px-2.5 py-2 font-sans text-sm font-medium text-zbc-gray-700 transition-colors duration-150 hover:bg-muted hover:text-primary"
                          >
                            {item.label}
                          </Link>
                        )}
                        {(item.children ?? []).map((child) =>
                          isExternalNavTarget(child) ? (
                            <a
                              key={child.id}
                              href={child.to}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={closeMenu}
                              className="block truncate rounded-lg px-2.5 py-1.5 pl-4 font-sans text-xs font-medium text-zbc-gray-500 transition-colors duration-150 hover:bg-muted hover:text-primary"
                            >
                              {child.label}
                            </a>
                          ) : (
                            <Link
                              key={child.id}
                              to={child.to}
                              onClick={closeMenu}
                              className="block truncate rounded-lg px-2.5 py-1.5 pl-4 font-sans text-xs font-medium text-zbc-gray-500 transition-colors duration-150 hover:bg-muted hover:text-primary"
                            >
                              {child.label}
                            </Link>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/** Desktop + tablet horizontal nav: Home | header_primary | More (if mega_menu) */
function MainNavBar() {
  const { homeItem, primaryItems, megaItems, hasMegaMenu } = useMainNav();

  return (
    <nav className="" aria-label="Main navigation">
      <div className="mx-auto flex w-full container items-center justify-start gap-0 overflow-x-auto px-4 py-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NavLink
          to={homeItem.to}
          end
          className={({ isActive }) =>
            cn(
              "relative shrink-0 whitespace-nowrap px-2.5 py-3 font-sans text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-primary"
                : "text-zbc-gray-700 hover:text-primary",
            )
          }
        >
          {homeItem.label}
        </NavLink>

        {primaryItems.map((item) => (
          <PrimaryNavItem key={item.id} item={item} />
        ))}

        {hasMegaMenu ? <MoreMenuDropdown items={megaItems} /> : null}
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
      <div className="mx-auto flex min-h-[42px] w-full container items-center justify-between gap-3 px-4 py-2">
        <nav
          className={cn(
            "flex flex-1 items-center gap-3 overflow-x-auto sm:gap-4",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {quickLinks.map(({ id, label, url, icon }) => {
            const Icon = icon
              ? (quickLinkIconMap[icon] ?? TrendingUp)
              : TrendingUp;
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { homeItem, mobileItems } = useMainNav();
  const quickLinks = useQuickLinks();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Whenever the drawer opens: expand the first item that has children.
  useEffect(() => {
    if (!open) {
      setExpandedIds(new Set());
      return;
    }
    const firstWithChildren = mobileItems.find(
      (item) => (item.children?.length ?? 0) > 0,
    );
    setExpandedIds(
      firstWithChildren ? new Set([firstWithChildren.id]) : new Set(),
    );
  }, [open, mobileItems]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      // Accordion: one open section at a time.
      if (prev.has(id)) return new Set();
      return new Set([id]);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="size-9 shrink-0 rounded-lg p-0 text-foreground bg-zbc-gray-100 hover:bg-muted lg:hidden"
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
            <nav className="flex flex-col gap-0.5" aria-label="Mobile menu">
              {/* Home is always first (hardcoded), even if also in the menu */}
              <DialogClose asChild>
                <Link
                  to={homeItem.to}
                  className={cn(
                    "rounded-lg px-3 py-2.5 font-sans text-[14px] font-medium transition-colors",
                    location.pathname === "/"
                      ? "bg-accent text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {homeItem.label}
                </Link>
              </DialogClose>

              {mobileItems.map((item) => {
                const children = item.children ?? [];
                const hasChildren = children.length > 0;
                const isExpanded = expandedIds.has(item.id);
                const isActive =
                  !isExternalNavTarget(item) &&
                  (location.pathname === item.to ||
                    children.some((child) => location.pathname === child.to));

                return (
                  <div key={item.id} className="flex flex-col">
                    <div className="flex items-center gap-0.5">
                      <DialogClose asChild>
                        {isExternalNavTarget(item) ? (
                          <a
                            href={item.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 rounded-lg px-3 py-2.5 font-sans text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link
                            to={item.to}
                            className={cn(
                              "min-w-0 flex-1 rounded-lg px-3 py-2.5 font-sans text-[14px] font-medium transition-colors",
                              isActive
                                ? "bg-accent text-primary"
                                : "text-foreground hover:bg-muted",
                            )}
                          >
                            {item.label}
                          </Link>
                        )}
                      </DialogClose>
                      {hasChildren ? (
                        <button
                          type="button"
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? `Collapse ${item.label}`
                              : `Expand ${item.label}`
                          }
                          onClick={() => toggleExpanded(item.id)}
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform duration-300 ease-out",
                              isExpanded && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>

                    {hasChildren ? (
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300 ease-out",
                          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div
                            className={cn(
                              "flex flex-col gap-0.5 pb-1 transition-opacity duration-300 ease-out",
                              isExpanded ? "opacity-100" : "opacity-0",
                            )}
                          >
                            {children.map((child) => {
                              const childActive =
                                !isExternalNavTarget(child) &&
                                location.pathname === child.to;
                              return (
                                <DialogClose asChild key={child.id}>
                                  {isExternalNavTarget(child) ? (
                                    <a
                                      href={child.to}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      tabIndex={isExpanded ? undefined : -1}
                                      className="rounded-lg py-2 pr-3 pl-6 font-sans text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                      {child.label}
                                    </a>
                                  ) : (
                                    <Link
                                      to={child.to}
                                      tabIndex={isExpanded ? undefined : -1}
                                      className={cn(
                                        "rounded-lg py-2 pr-3 pl-6 font-sans text-[13px] font-medium transition-colors",
                                        childActive
                                          ? "bg-accent/70 text-primary"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                      )}
                                    >
                                      {child.label}
                                    </Link>
                                  )}
                                </DialogClose>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <nav
              className="flex flex-col gap-0.5 border-t border-border pt-3"
              aria-label="Quick links"
            >
              {quickLinks.map(({ id, label, url, icon }) => {
                const Icon = icon
                  ? (quickLinkIconMap[icon] ?? TrendingUp)
                  : TrendingUp;
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
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
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
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full gap-2"
                  >
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
  const [iso, setIso] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setIso(now.toISOString());
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

  return <time dateTime={iso || undefined}>{formatted || "—"}</time>;
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
          {/* Mobile Menu Button - now visible up to 1023px */}
          <div className="lg:hidden">
            <MobileMenu />
          </div>

          {/* Logo */}
          <div
            className="
              min-w-0
              absolute left-1/2 -translate-x-1/2
              md:left-auto md:translate-x-0 md:static
              lg:hidden
            "
          >
            <BrandLogo compact />
          </div>

          <div className="hidden lg:block" data-header-logo-start="true">
            <BrandLogo />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 lg:gap-4">
            {/* Search - now only inline on desktop (1024+), grows to fill the gap */}
            <div className="hidden min-w-0 md:flex md:flex-1">
              <SearchField className="w-full" onOpen={() => setSearchOpen(true)} />
            </div>

            {/* Desktop Menu (1024+) */}
            <div className="hidden shrink-0 lg:block">
              <MainNavBar />
            </div>

            {/* Account - full label only at 1024+, compact below */}
            <div
              className="hidden shrink-0 lg:flex"
              data-header-account-end="true"
            >
              <AccountActions />
            </div>

            <div className="flex shrink-0 lg:hidden">
              <AccountActions showLabel={false} />
            </div>
          </div>
        </div>

        {/* Mobile search below logo row - shown up to 1023px */}
        <div className="mb-2 p-0 md:hidden md:p-3">
          <SearchField onOpen={() => setSearchOpen(true)} />
        </div>
      </div>

      {/* Mobile main nav row - shown up to 1023px */}
      <div className="border-t border-border block lg:hidden">
        <MainNavBar />
      </div>

      <SubNavBar />

      {/* <p>mahfuj bhai amare bujlo na ds fcvsdfsd</p> */}
    </header>
  );
}