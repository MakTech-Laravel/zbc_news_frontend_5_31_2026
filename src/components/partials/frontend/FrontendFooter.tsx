import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { NewsletterSignupForm } from "@/components/newsletter/NewsletterSignupForm";
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

type SocialIconProps = { className?: string };

function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TikTokIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 448 512"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V258.2a90.07 90.07 0 1 0 57.6 84.38V0h67.57a142.7 142.7 0 0 0 1.56 20.8 143.08 143.08 0 0 0 100.83 118.8z" />
    </svg>
  );
}

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/zomibroadcasting", icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://x.com/zbcglobalnews", icon: XIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/zbcnews", icon: LinkedInIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@zbcnews", icon: TikTokIcon },
  { label: "Instagram", href: "https://www.instagram.com/zomibroadcasting", icon: InstagramIcon },
] as const;

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
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
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
