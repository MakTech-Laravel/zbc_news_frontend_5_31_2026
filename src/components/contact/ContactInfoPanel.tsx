import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  PenLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { buildContactChannels, buildOfficeDisplay, buildSocialLinks } from "@/lib/siteSocialContact";

type ContactChannel = {
  title: string;
  email: string;
  Icon: LucideIcon;
};

const CONTACT_ICONS: Record<string, LucideIcon> = {
  "General Inquiries": Mail,
  "Press / Media": Newspaper,
  Advertising: Megaphone,
  Corrections: PenLine,
};

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
  const { settings } = useSiteSettings();
  const contactChannels: ContactChannel[] = buildContactChannels(settings).map((channel) => ({
    ...channel,
    Icon: CONTACT_ICONS[channel.title] ?? Mail,
  }));
  const socialLinks = buildSocialLinks(settings);
  const office = buildOfficeDisplay(settings);

  return (
    <div className="space-y-8">
      <article className="rounded-lg border border-zbc-gray-200 bg-linear-to-br from-brand-soft to-zbc-gray-50 p-8">
        <h3 className="text-xl font-bold leading-7 text-zbc-gray-1000">Direct Contact</h3>
        <div className="mt-6 space-y-4">
          {contactChannels.map((channel) => (
            <ContactChannelRow key={channel.title} {...channel} />
          ))}
        </div>
      </article>

      {office ? (
        <article className="rounded-lg border border-zbc-gray-200 bg-white p-8">
          <h3 className="text-xl font-bold leading-7 text-zbc-gray-1000">Our Office</h3>
          <div className="mt-4 flex items-start gap-3">
            <MapPin className="mt-1 size-5 shrink-0 text-zbc-blue" strokeWidth={2.2} />
            <address className="not-italic text-sm leading-[1.625rem] text-[#364153]">
              {office.lines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < office.lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </address>
          </div>
          <a
            href={office.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold leading-5 text-zbc-blue hover:underline"
          >
            <ExternalLink className="size-4" />
            View on Google Maps
          </a>
        </article>
      ) : null}

      {socialLinks.length > 0 ? (
        <article className="rounded-lg border border-zbc-gray-200 bg-white p-8">
          <h3 className="text-xl font-bold leading-7 text-zbc-gray-1000">Follow Us</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {socialLinks.map(({ key, label, handle, href, Icon }) => (
              <a
                key={key}
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
      ) : null}

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
