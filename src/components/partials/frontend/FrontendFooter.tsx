import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { NewsletterSignupForm } from "@/components/newsletter/NewsletterSignupForm";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { buildSocialLinks } from "@/lib/siteSocialContact";
import {
  fetchMenuByLocation,
  flattenMenuItemsToLinks,
  MENU_LOCATION,
} from "@/services/frontend/navigation";

type FooterLink = {
  id?: string;
  label: string;
  to: string;
  target?: string;
};

type FooterColumnData = {
  title: string;
  links: FooterLink[];
};

/** Fallback when a footer location has no menu assigned yet. */
const FOOTER_FALLBACK_COLUMNS: Record<
  "company" | "legal",
  { title: string; links: readonly FooterLink[] }
> = {
  company: {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Newsletter", to: "/newsletter" },
      { label: "Advertise", to: "/advertise" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Accessibility", to: "/accessibility-statement" },
    ],
  },
};


function isExternalLink(link: FooterLink) {
  if (link.target === "_blank") return true;
  return /^(https?:|mailto:|tel:)/i.test(link.to);
}

function useFooterColumns(): FooterColumnData[] {
  const [columns, setColumns] = useState<FooterColumnData[]>([
    { title: "Sections", links: [] },
    {
      title: FOOTER_FALLBACK_COLUMNS.company.title,
      links: [...FOOTER_FALLBACK_COLUMNS.company.links],
    },
    {
      title: FOOTER_FALLBACK_COLUMNS.legal.title,
      links: [...FOOTER_FALLBACK_COLUMNS.legal.links],
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchMenuByLocation(MENU_LOCATION.footer),
      fetchMenuByLocation(MENU_LOCATION.footerCompany),
      fetchMenuByLocation(MENU_LOCATION.footerLegal),
    ])
      .then(([sectionsMenu, companyMenu, legalMenu]) => {
        if (!isMounted) return;

        const sectionsLinks = flattenMenuItemsToLinks(sectionsMenu?.items ?? []);
        const companyLinks = flattenMenuItemsToLinks(companyMenu?.items ?? []);
        const legalLinks = flattenMenuItemsToLinks(legalMenu?.items ?? []);

        setColumns([
          {
            title: "Sections",
            links: sectionsLinks,
          },
          {
            title: "Company",
            links:
              companyLinks.length > 0
                ? companyLinks
                : [...FOOTER_FALLBACK_COLUMNS.company.links],
          },
          {
            title: "Legal",
            links:
              legalLinks.length > 0
                ? legalLinks
                : [...FOOTER_FALLBACK_COLUMNS.legal.links],
          },
        ]);
      })
      .catch(() => {
        /* keep fallbacks */
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return columns;
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  if (links.length === 0) return null;

  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
        {title}
      </h4>
      <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
        {links.map((link) => (
          <li key={link.id ?? `${link.label}-${link.to}`}>
            {isExternalLink(link) ? (
              <a
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#cbd5e1] transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                to={link.to}
                className="text-sm text-[#cbd5e1] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FrontendFooter() {
  const year = new Date().getFullYear();
  const footerColumns = useFooterColumns();
  const { settings } = useSiteSettings();
  const socialLinks = buildSocialLinks(settings);

  return (
    <footer className="mt-auto bg-zbc-footer text-[#cbd5e1]">
      <div className="mx-auto w-full container px-4 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10 lg:gap-12">
          {footerColumns.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-[#1e293b] bg-[#0f172a] p-6">
          <NewsletterSignupForm
            variant="footer"
            source="footer"
            showCategories
            title="Stay in the loop"
            description="Subscribe for daily headlines and category updates tailored to your interests."
          />
        </div>

        <div className="mt-10 border-t border-[#1e293b] pt-6 sm:mt-12 sm:pt-7">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-[#94a3b8]">
              &copy; {year} ZBC NEWS Media Group. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-8 items-center justify-center rounded-md text-[#94a3b8] transition-colors hover:bg-[#1e293b] hover:text-white"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
