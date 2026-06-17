export const TERMS_NAV = [
  { id: "quick-summary", label: "Quick Summary" },
  { id: "account-terms", label: "Account Terms" },
  { id: "content-ip", label: "Content & IP" },
  { id: "subscriptions-payment", label: "Subscriptions & Payment" },
  { id: "prohibited-conduct", label: "Prohibited Content" },
  { id: "disputes-legal", label: "Disputes & Legal" },
  { id: "contact-legal", label: "Contact Legal" },
] as const;

export const TERMS_KEY_POINTS = [
  "You must be 16+ to use ZBC News.",
  "We do not tolerate harassment or misinformation.",
  "Disputes are resolved via arbitration (NY law).",
  "You own content you submit; you license it to us.",
  "Subscriptions auto-renew; cancel anytime.",
  "We may suspend accounts that violate these terms.",
];

export const TERMS_ACCOUNT_ITEMS = [
  "Provide accurate, complete, and up-to-date registration information",
  "Maintain the security and confidentiality of your password",
  "Be at least 16 years old (18 in some jurisdictions)",
  "Notify us immediately of any unauthorised use at security@zbcnews.com",
  "Hold only one personal account — accounts are non-transferable",
];

export const TERMS_SUBSCRIPTION_ITEMS = [
  "Subscriptions auto-renew at the end of each billing period",
  "Cancel anytime from account settings; access continues until period end",
  "Annual subscribers receive a pro-rated refund if cancelled within 14 days",
  "Payments processed by Stripe. We don't store card numbers.",
  "Failed payments result in a 7-day grace period before access suspension",
];

export const TERMS_PROHIBITED_ITEMS = [
  "Post false, misleading, or defamatory information",
  "Harass, threaten, or abuse other users or our staff",
  "Scrape, crawl, or systematically download content without permission",
  "Use ZBC News for political propaganda, undisclosed advertising, or coordinated influence operations",
  "Circumvent paywalls, access controls, or technical restrictions",
  "Impersonate ZBC News journalists or staff",
  "Upload malware, viruses, or harmful code",
];

export const TERMS_LEGAL_EMAIL = "legal@zbcnews.com";
export const TERMS_HELP_EMAIL = "help@zbcnews.com";
export const TERMS_DMCA_EMAIL = "dmca@zbcnews.com";
