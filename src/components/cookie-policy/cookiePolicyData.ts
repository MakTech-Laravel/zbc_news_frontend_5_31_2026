import type { LucideIcon } from "lucide-react";
import { BarChart3, Settings, Shield, Target } from "lucide-react";

export type CookieCategoryId = "essential" | "analytics" | "preferences" | "advertising";

export type CookieCategory = {
  id: CookieCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
  alwaysOn?: boolean;
  defaultEnabled: boolean;
};

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    title: "Strictly Essential",
    description:
      "These cookies are necessary for the website to function and cannot be disabled. They include session management, security tokens, and load balancing.",
    icon: Shield,
    alwaysOn: true,
    defaultEnabled: true,
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Help us understand how readers use ZBC News — which articles are read, how traffic arrives, and where readers drop off. We use Plausible, a privacy-first analytics tool that does not use cookies or track individuals.",
    icon: BarChart3,
    defaultEnabled: true,
  },
  {
    id: "preferences",
    title: "Preferences",
    description:
      "Remember your choices — display preferences, newsletter settings, region, and article view layout.",
    icon: Settings,
    defaultEnabled: true,
  },
  {
    id: "advertising",
    title: "Advertising & Targeting",
    description:
      "Used to show you relevant advertising content based on your reading history and inferred interests. Disabling these means you'll still see ads — they'll just be less relevant to you.",
    icon: Target,
    defaultEnabled: false,
  },
];

export const BROWSER_CONTROLS = [
  {
    browser: "Chrome",
    path: "Settings → Privacy & Security → Cookies and other site data",
  },
  {
    browser: "Firefox",
    path: "Settings → Privacy & Security → Cookies and Site Data",
  },
  {
    browser: "Safari",
    path: "Preferences → Privacy → Manage Website Data",
  },
  {
    browser: "Edge",
    path: "Settings → Cookies and Site Permissions → Manage and delete cookies",
  },
];

export const COOKIE_FAQ = [
  {
    question: "What exactly is a cookie?",
    answer:
      "A cookie is a small text file stored on your device when you visit a website. It helps the site remember your preferences, keep you logged in, and understand how you use the service.",
  },
  {
    question: "Can I use ZBC News without cookies?",
    answer:
      "Essential cookies are required for core functionality like signing in and security. Optional cookies for analytics, preferences, and advertising can be disabled using the toggles above.",
  },
  {
    question: "How do I delete cookies already on my device?",
    answer:
      "You can clear cookies through your browser settings (see the browser controls section above) or by using the \"Reject All Optional\" button on this page.",
  },
  {
    question: "Do you use third-party advertising cookies?",
    answer:
      "Only with your consent. Advertising cookies are disabled by default. When enabled, they help show more relevant ads based on your reading interests.",
  },
  {
    question: "What's your cookie retention policy?",
    answer:
      "Session cookies expire when you close your browser. Persistent cookies are retained for up to 12 months unless you clear them sooner. Essential security tokens follow shorter rotation schedules.",
  },
];

export const COOKIE_PRIVACY_EMAIL = "privacy@zbcnews.com";
