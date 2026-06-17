export const PRIVACY_NAV = [
  { id: "overview", label: "Overview" },
  { id: "data-we-collect", label: "Data We Collect" },
  { id: "how-we-use-it", label: "How We Use It" },
  { id: "your-rights", label: "Your Rights" },
  { id: "data-security", label: "Data Security" },
  { id: "third-parties", label: "Third Parties" },
  { id: "contact-us", label: "Contact Us" },
] as const;

export const PRIVACY_PLAIN_SUMMARY =
  "ZBC News collects information you provide and data about how you use our site. We use it to run the platform, personalise your experience, and deliver news. We don't sell your personal data. EU/UK/CA residents have specific data rights detailed below. The full policy below is legally binding.";

export const PRIVACY_INFO_YOU_GIVE = [
  "Account registration: name, email, password, and subscription details",
  "Payment information (processed via Stripe — we don't store card numbers)",
  "Comments, letters, and editorial submissions",
  "Correspondence with our editorial, support, or advertising teams",
  "Newsletter subscriptions and reading preferences",
];

export const PRIVACY_AUTO_COLLECTED = [
  "Log data: IP address, browser, referring URL, pages visited, timestamps",
  "Device data: screen size, OS, browser type, device identifiers",
  "Reading behaviour: articles read, time on page, scroll depth, search queries",
  "Cookie data — see our Cookie Policy for full details",
];

export const PRIVACY_USE_PURPOSES = [
  "Delivering news content, newsletters, and notifications you've requested",
  "Processing subscription payments and managing your account",
  "Personalising article recommendations based on reading history",
  "Displaying contextual and behavioural advertising (where consented)",
  "Analysing usage to improve our editorial and technical products",
  "Complying with legal obligations and protecting against fraud",
];

export const PRIVACY_RIGHTS = [
  { title: "Access", description: "Request a copy of the data we hold about you" },
  { title: "Rectification", description: "Correct inaccurate or incomplete data" },
  { title: "Erasure", description: "Request deletion of your personal data" },
  { title: "Portability", description: "Receive your data in machine-readable format" },
  { title: "Objection", description: "Object to processing based on legitimate interests" },
  { title: "Restrict Processing", description: "Limit how we use your data" },
];

export const PRIVACY_SECURITY = [
  "TLS 1.3 encryption for all data in transit",
  "AES-256 encryption for sensitive data at rest",
  "SOC 2 Type II certified infrastructure (AWS us-east-1)",
  "Regular third-party penetration testing",
  "Employee security training and role-based access controls",
  "72-hour breach notification procedures",
];

export const PRIVACY_THIRD_PARTIES = [
  { provider: "Stripe", purpose: "Payment processing", location: "US/EU" },
  { provider: "Amazon Web Services", purpose: "Hosting & storage", location: "US" },
  { provider: "Plausible Analytics", purpose: "Privacy-first analytics", location: "EU" },
  { provider: "Postmark", purpose: "Transactional email", location: "US" },
  { provider: "Cloudflare", purpose: "CDN & DDoS protection", location: "US/Global" },
];

export const PRIVACY_EMAIL = "privacy@zbcnews.com";
