import { request } from "@/api/request";

export type QuickLink = {
  id: number;
  label: string;
  url: string;
  icon?: string | null;
  sort_order?: number;
};

export type PublicMenuItem = {
  id: number | string;
  type?: string;
  label: string;
  url?: string | null;
  target?: string | null;
  icon?: string | null;
  children?: PublicMenuItem[];
};

export type PublicMenu = {
  id: number;
  name: string;
  slug: string;
  location?: {
    key: string;
    name: string;
    render_style?: string;
  } | null;
  items: PublicMenuItem[];
};

export const MENU_LOCATION = {
  headerPrimary: "header_primary",
  headerMobile: "header_mobile",
  megaMenu: "mega_menu",
  sidebar: "sidebar",
  footer: "footer",
  footerCompany: "footer_company",
  footerLegal: "footer_legal",
} as const;

export async function fetchQuickLinks(): Promise<QuickLink[]> {
  const response = await request.get("/navigation/quick-links");
  const payload = response.data?.data;
  if (!Array.isArray(payload)) return [];
  return payload as QuickLink[];
}

/** Public menu for a location key. Returns null when unassigned / inactive / 404. */
export async function fetchMenuByLocation(
  locationKey: string,
): Promise<PublicMenu | null> {
  try {
    const response = await request.get(`/menus/location/${locationKey}`, {
      // Avoid noisy console / auth redirects for optional locations.
      validateStatus: (status: number) =>
        (status >= 200 && status < 300) || status === 404,
    });

    if (response.status === 404 || response.data?.success === false) {
      return null;
    }

    const payload = response.data?.data;
    if (!payload || typeof payload !== "object") return null;

    return {
      id: Number(payload.id),
      name: String(payload.name ?? ""),
      slug: String(payload.slug ?? ""),
      location: payload.location ?? null,
      items: Array.isArray(payload.items) ? payload.items : [],
    };
  } catch {
    return null;
  }
}

export type NavChild = {
  id: string;
  label: string;
  to: string;
  target?: string;
};

export type NavItem = {
  id: string;
  label: string;
  to: string;
  target?: string;
  icon?: string | null;
  children?: NavChild[];
};

function normalizeUrl(url?: string | null): string {
  const raw = (url ?? "").trim();
  if (!raw) return "/";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("mailto:") ||
    raw.startsWith("tel:")
  ) {
    return raw;
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/** Map API menu tree → header nav items (one level of children). */
export function mapMenuItemsToNav(items: PublicMenuItem[]): NavItem[] {
  return items
    .filter((item) => Boolean(item?.label))
    .map((item) => {
      const children = Array.isArray(item.children) ? item.children : [];
      return {
        id: String(item.id),
        label: item.label,
        to: normalizeUrl(item.url),
        target: item.target ?? undefined,
        icon: item.icon ?? null,
        children: children
          .filter((child) => Boolean(child?.label))
          .map((child) => ({
            id: String(child.id),
            label: child.label,
            to: normalizeUrl(child.url),
            target: child.target ?? undefined,
          })),
      };
    });
}

/** Drop duplicate Home entries when Home is already hardcoded in the header. */
export function withoutHomeNavItem(items: NavItem[]): NavItem[] {
  return items.filter((item) => {
    const label = item.label.trim().toLowerCase();
    return !(label === "home" && (item.to === "/" || item.to === ""));
  });
}

/** Flatten menu roots + one level of children for footer / list layouts. */
export function flattenMenuItemsToLinks(
  items: PublicMenuItem[],
): Array<{ id: string; label: string; to: string; target?: string }> {
  const out: Array<{ id: string; label: string; to: string; target?: string }> =
    [];

  for (const item of mapMenuItemsToNav(items)) {
    out.push({
      id: item.id,
      label: item.label,
      to: item.to,
      target: item.target,
    });
    for (const child of item.children ?? []) {
      out.push({
        id: child.id,
        label: child.label,
        to: child.to,
        target: child.target,
      });
    }
  }

  return out;
}
