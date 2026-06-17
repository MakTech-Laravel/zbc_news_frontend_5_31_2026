import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  PenLine,
} from "lucide-react";

type ContactChannel = {
  title: string;
  email: string;
  Icon: typeof Mail;
};

const CONTACT_CHANNELS: ContactChannel[] = [
  { title: "General Inquiries", email: "hello@zbcnews.com", Icon: Mail },
  { title: "Press / Media", email: "press@zbcnews.com", Icon: Newspaper },
  { title: "Advertising", email: "ads@zbcnews.com", Icon: Megaphone },
  { title: "Corrections", email: "corrections@zbcnews.com", Icon: PenLine },
];

type SocialIconProps = { className?: string };

function XIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Twitter", handle: "@zbcnews", href: "https://x.com/zbcnews", Icon: XIcon },
  { label: "Facebook", handle: "/zbcnews", href: "https://facebook.com/zbcnews", Icon: FacebookIcon },
  { label: "LinkedIn", handle: "/company/zbcnews", href: "https://linkedin.com/company/zbcnews", Icon: LinkedInIcon },
  { label: "Instagram", handle: "@zbcnews", href: "https://instagram.com/zbcnews", Icon: InstagramIcon },
] as const;

function ContactChannelRow({ title, email, Icon }: ContactChannel) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#dbeafe] text-zbc-blue">
        <Icon className="size-[18px]" strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-sm font-semibold leading-5 text-zbc-gray-1000">{title}</p>
        <a href={`mailto:${email}`} className="text-sm leading-5 text-zbc-blue hover:underline">
          {email}
        </a>
      </div>
    </div>
  );
}

export function ContactInfoPanel() {
  return (
    <div className="space-y-8">
      <article className="rounded-lg border border-zbc-gray-200 bg-linear-to-br from-brand-soft to-zbc-gray-50 p-8">
        <h3 className="text-xl font-bold leading-7 text-zbc-gray-1000">Direct Contact</h3>
        <div className="mt-6 space-y-4">
          {CONTACT_CHANNELS.map((channel) => (
            <ContactChannelRow key={channel.email} {...channel} />
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-zbc-gray-200 bg-white p-8">
        <h3 className="text-xl font-bold leading-7 text-zbc-gray-1000">Our Office</h3>
        <div className="mt-4 flex items-start gap-3">
          <MapPin className="mt-1 size-5 shrink-0 text-zbc-blue" strokeWidth={2.2} />
          <address className="not-italic text-sm leading-[1.625rem] text-[#364153]">
            425 Fifth Avenue, Suite 1200
            <br />
            New York, NY 10016
            <br />
            United States
          </address>
        </div>
        <a
          href="https://maps.google.com/?q=425+Fifth+Avenue+Suite+1200+New+York+NY+10016"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold leading-5 text-zbc-blue hover:underline"
        >
          <ExternalLink className="size-4" />
          View on Google Maps
        </a>
      </article>

      <article className="rounded-lg border border-zbc-gray-200 bg-white p-8">
        <h3 className="text-xl font-bold leading-7 text-zbc-gray-1000">Follow Us</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIAL_LINKS.map(({ label, handle, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-zbc-gray-200 p-3 transition-colors hover:border-zbc-blue/40 hover:bg-zbc-gray-50"
            >
              <Icon className="size-5 shrink-0 text-zbc-blue" />
              <div>
                <p className="text-xs font-semibold leading-4 text-zbc-gray-1000">{label}</p>
                <p className="text-xs leading-4 text-admin-trend-muted">{handle}</p>
              </div>
            </a>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-[#bedbff] bg-brand-soft p-6">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 size-5 shrink-0 text-[#1c398e]" strokeWidth={2.2} />
          <div>
            <p className="text-sm font-semibold leading-5 text-[#1c398e]">Response Time</p>
            <p className="pt-1 text-sm leading-5 text-[#1447e6]">
              We aim to respond to all inquiries within 2-3 business days.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
