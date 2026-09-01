import type { ComponentType } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  XIcon,
  type SocialIconProps,
} from "@/components/shared/SocialBrandIcons";

export type SocialLinkKey =
  | "facebook"
  | "x"
  | "linkedin"
  | "tiktok"
  | "instagram";

export type SocialContactSettings = {
  socialFacebookUrl: string;
  socialXUrl: string;
  socialLinkedinUrl: string;
  socialTiktokUrl: string;
  socialInstagramUrl: string;
  contactGeneralEmail: string;
  contactPressEmail: string;
  contactAdvertisingEmail: string;
  contactCorrectionsEmail: string;
  contactOfficeAddress: string;
  contactOfficeMapsUrl: string;
};

export const DEFAULT_SOCIAL_CONTACT_SETTINGS: SocialContactSettings = {
  socialFacebookUrl: "",
  socialXUrl: "",
  socialLinkedinUrl: "",
  socialTiktokUrl: "",
  socialInstagramUrl: "",
  contactGeneralEmail: "",
  contactPressEmail: "",
  contactAdvertisingEmail: "",
  contactCorrectionsEmail: "",
  contactOfficeAddress: "",
  contactOfficeMapsUrl: "",
};

export type ResolvedSocialLink = {
  key: SocialLinkKey;
  label: string;
  href: string;
  handle: string;
  Icon: ComponentType<SocialIconProps>;
};

const SOCIAL_DEFINITIONS: Array<{
  key: SocialLinkKey;
  label: string;
  field: keyof SocialContactSettings;
  Icon: ComponentType<SocialIconProps>;
}> = [
  { key: "facebook", label: "Facebook", field: "socialFacebookUrl", Icon: FacebookIcon },
  { key: "x", label: "X (Twitter)", field: "socialXUrl", Icon: XIcon },
  { key: "linkedin", label: "LinkedIn", field: "socialLinkedinUrl", Icon: LinkedInIcon },
  { key: "tiktok", label: "TikTok", field: "socialTiktokUrl", Icon: TikTokIcon },
  { key: "instagram", label: "Instagram", field: "socialInstagramUrl", Icon: InstagramIcon },
];

export function resolveSocialContactSettings(
  partial?: Partial<SocialContactSettings> | null,
): SocialContactSettings {
  return {
    ...DEFAULT_SOCIAL_CONTACT_SETTINGS,
    ...partial,
  };
}

export function deriveSocialHandle(url: string, key: SocialLinkKey): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? parsed.hostname;

    switch (key) {
      case "x":
      case "instagram":
      case "tiktok":
        return last.startsWith("@") ? last : `@${last.replace(/^@/, "")}`;
      case "linkedin":
        return segments.length > 1 ? `/${segments.join("/")}` : `/${last}`;
      case "facebook":
      default:
        return `/${last}`;
    }
  } catch {
    return trimmed;
  }
}

export function buildSocialLinks(
  settings?: Partial<SocialContactSettings> | null,
): ResolvedSocialLink[] {
  const resolved = resolveSocialContactSettings(settings);

  return SOCIAL_DEFINITIONS.flatMap(({ key, label, field, Icon }) => {
    const href = resolved[field].trim();
    if (!href) return [];

    return [
      {
        key,
        label,
        href,
        handle: deriveSocialHandle(href, key),
        Icon,
      },
    ];
  });
}

export type ContactChannelDefinition = {
  title: string;
  email: string;
};

export function buildContactChannels(
  settings?: Partial<SocialContactSettings> | null,
): ContactChannelDefinition[] {
  const resolved = resolveSocialContactSettings(settings);

  return [
    { title: "General Inquiries", email: resolved.contactGeneralEmail },
    { title: "Press / Media", email: resolved.contactPressEmail },
    { title: "Advertising", email: resolved.contactAdvertisingEmail },
    { title: "Corrections", email: resolved.contactCorrectionsEmail },
  ].filter((channel) => channel.email.trim());
}

export type OfficeDisplay = {
  lines: string[];
  mapsUrl: string;
};

export function buildOfficeDisplay(
  settings?: Partial<SocialContactSettings> | null,
): OfficeDisplay | null {
  const resolved = resolveSocialContactSettings(settings);
  const lines = resolved.contactOfficeAddress
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const mapsUrl =
    resolved.contactOfficeMapsUrl.trim() ||
    `https://maps.google.com/?q=${encodeURIComponent(lines.join(", "))}`;

  return { lines, mapsUrl };
}
