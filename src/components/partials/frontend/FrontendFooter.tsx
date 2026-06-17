import { Link } from "react-router-dom";
import { NewsletterSignupForm } from "@/components/newsletter/NewsletterSignupForm";


type FooterLink = { label: string; to: string };

const FOOTER_COLUMNS: { title: string; links: readonly FooterLink[] }[] = [
  {
    title: "Sections",
    links: [
      { label: "Latest News", to: "/" },
      { label: "Politics", to: "/politics" },
      { label: "Business", to: "/business" },
      { label: "Sports", to: "/sports" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Entertainment", to: "/entertainment" },
      { label: "Technology", to: "/technology" },
      { label: "World News", to: "/world" },
      { label: "Video/Media", to: "/video" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Contact", to: "/contact" },
      { label: "Advertise", to: "/advertise" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms of Service", to: "/terms-of-service" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Accessibility", to: "/accessibility-statement" },
    ],
  },
];

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

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://x.com", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
] as const;

function FooterColumn({ title, links }: { title: string; links: readonly FooterLink[] }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
        {title}
      </h4>
      <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-[#cbd5e1] transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FrontendFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-zbc-footer text-[#cbd5e1]">
      <div className="mx-auto w-full container px-4 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10 lg:gap-12">
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
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
