import * as React from "react";
import { ChevronDown } from "lucide-react";

import { SeoEditButton } from "@/components/admin/settings/SeoEditButton";
import { fetchAdminSeoPages } from "@/services/admin/seoPages";
import type { SeoPage } from "@/types/siteSettings";
import { cn } from "@/lib/utils";

function displayMetaTitle(value: string) {
  return value.trim() || "Meta title";
}

function displayUrl(value: string) {
  return value.trim() || "URL";
}

function useIsMobile(breakpoint = 992) {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export function SeoPublicPagesList() {
  const [pages, setPages] = React.useState<SeoPage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    fetchAdminSeoPages()
      .then((rows) => {
        const sorted = [...rows].sort((a, b) => {
          const rank = (page: SeoPage) => {
            if (page.pageKey === "home") return 0;
            if (!page.isTemplate) return 1;
            return 2;
          };
          const diff = rank(a) - rank(b);
          return diff !== 0 ? diff : a.name.localeCompare(b.name);
        });
        setPages(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  const [openRows, setOpenRows] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setOpenRows(new Set(pages.map((p) => p.id)));
  }, [pages]);

  function toggleRow(id: string) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-40 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card pl-2 pr-6 py-6">
      <div className="mb-6 px-2">
        <h2 className="text-xl font-medium text-[#121212]">Public pages</h2>
        <p className="mt-1 text-base text-[#2b2a2a]">
          Pick a page and update its SEO metadata.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border border-border">
              <th className="px-3 py-2.5 text-base font-medium text-admin-heading">
                Page
              </th>

              {!isMobile && (
                <>
                  <th className="px-3 py-2.5 text-center text-base font-medium text-admin-heading">
                    URL
                  </th>
                  <th className="px-3 py-2.5 text-center text-base font-medium text-admin-heading">
                    Meta title
                  </th>
                  <th className="w-25 px-3 py-2.5" aria-label="Actions" />
                </>
              )}

              {isMobile && (
                <th className="w-10 px-3 py-2.5" aria-label="Expand" />
              )}
            </tr>
          </thead>

          <tbody>
            {pages.map((page, index) => {
              const isOpen = openRows.has(page.id);

              return (
                <React.Fragment key={page.id}>
                  <tr
                    className={cn(
                      "border-x border-b border-border",
                      index === pages.length - 1 && !isMobile && "rounded-b-lg",
                    )}
                  >
                    <td className="px-3 py-2.5 text-base font-medium text-admin-heading">
                      {page.name}
                      {page.isTemplate ? (
                        <span className="ml-2 text-xs font-normal text-admin-trend-muted">
                          template
                        </span>
                      ) : null}
                    </td>

                    {!isMobile && (
                      <>
                        <td className="px-3 py-2.5 text-center text-base text-[#555555]">
                          {displayUrl(page.url)}
                        </td>
                        <td className="px-3 py-2.5 text-center text-base text-[#555555]">
                          {displayMetaTitle(page.metaTitle)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <SeoEditButton to={`/admin/settings/seo/${page.pageKey}`} />
                        </td>
                      </>
                    )}

                    {isMobile && (
                      <td className="w-10 px-3 py-2.5 align-middle">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleRow(page.id)}
                            aria-label={isOpen ? "Collapse row" : "Expand row"}
                            aria-expanded={isOpen}
                            className={cn(
                              "inline-flex size-7 items-center justify-center rounded border border-border",
                              "text-admin-trend-muted transition-colors hover:bg-admin-surface hover:text-admin-heading",
                              isOpen && "border-primary/30 bg-admin-surface text-admin-heading",
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform duration-200",
                                isOpen && "rotate-180",
                              )}
                              aria-hidden
                            />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {isMobile && (
                    <tr>
                      <td colSpan={2} className="p-0">
                        <div
                          className={cn(
                            "grid transition-all duration-200 ease-in-out",
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="overflow-hidden">
                            <div
                              className={cn(
                                "border-x border-b border-border bg-admin-surface/50 px-4 py-3",
                                !isOpen && "border-b-0",
                              )}
                            >
                              <div className="mb-3 space-y-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-trend-muted">
                                  More details
                                </p>
                                <div className="flex items-start gap-3">
                                  <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-admin-trend-muted">
                                    URL
                                  </span>
                                  <span className="text-sm text-admin-heading">
                                    {displayUrl(page.url)}
                                  </span>
                                </div>
                                <div className="flex items-start gap-3">
                                  <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-admin-trend-muted">
                                    Meta title
                                  </span>
                                  <span className="text-sm text-admin-heading">
                                    {displayMetaTitle(page.metaTitle)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 border-t border-border pt-3">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-trend-muted">
                                  Actions
                                </p>
                                <SeoEditButton to={`/admin/settings/seo/${page.pageKey}`} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
