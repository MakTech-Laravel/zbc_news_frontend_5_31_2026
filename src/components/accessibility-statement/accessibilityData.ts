import type { LucideIcon } from "lucide-react";
import { Eye, Keyboard, MonitorSmartphone, Volume2 } from "lucide-react";

export const ACCESSIBILITY_BADGES = [
  { label: "WCAG 2.1 AA Compliant", variant: "success" as const },
  { label: "Last Audited: April 2026", variant: "info" as const },
  { label: "Next Audit: October 2026", variant: "info" as const },
];

export const COMMITMENT_STATS = [
  { value: "WCAG 2.1 AA", label: "Compliance Standard" },
  { value: "2×/year", label: "Formal Audits" },
  { value: "5 days", label: "Priority Issue Fix" },
  { value: "100%", label: "New Features Tested" },
];

export type AccessibilityFeature = {
  title: string;
  icon: LucideIcon;
  items: string[];
};

export const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  {
    title: "Visual Accessibility",
    icon: Eye,
    items: [
      "WCAG 2.1 AA minimum contrast ratios throughout (4.5:1 body, 3:1 UI)",
      "Supports browser zoom up to 200% without horizontal scrolling",
      "Respects prefers-reduced-motion for animations",
      "High-contrast mode support",
      "No information conveyed by colour alone",
    ],
  },
  {
    title: "Keyboard Navigation",
    icon: Keyboard,
    items: [
      "All interactive elements reachable via Tab key",
      "Logical, document-order focus sequence",
      "Visible focus indicator on all elements",
      "Skip navigation link (Tab on first load)",
      "No keyboard traps in modals or overlays",
    ],
  },
  {
    title: "Screen Reader Support",
    icon: Volume2,
    items: [
      "Semantic HTML5 structure throughout",
      "ARIA roles, labels, and landmark regions",
      "Descriptive alt text on images",
      "Form labels associated with inputs",
      "Tested with NVDA, JAWS, VoiceOver, and TalkBack",
    ],
  },
  {
    title: "Responsive & Adaptive",
    icon: MonitorSmartphone,
    items: [
      "Fully responsive from 320px to 8K displays",
      "Touch targets minimum 44×44px",
      "Content reflows at 400% zoom",
      "Portrait and landscape orientation support",
      "Print stylesheet for all pages",
    ],
  },
];

export const KEYBOARD_SHORTCUTS = [
  { key: "Tab", action: "Move focus to next interactive element" },
  { key: "Shift + Tab", action: "Move focus to previous element" },
  { key: "Enter / Space", action: "Activate button or link" },
  { key: "Escape", action: "Close modal, dropdown, or overlay" },
  { key: "Arrow Keys", action: "Navigate within menus, tabboards, or lists" },
  { key: "H", action: "Jump to next heading (screen reader mode)" },
  { key: "1 – 6", action: "Jump to heading level (screen reader mode)" },
];

export const SUPPORTED_TECHNOLOGIES = [
  { name: "NVDA", platform: "Windows", status: "Supported" as const },
  { name: "JAWS", platform: "Windows", status: "Supported" as const },
  { name: "VoiceOver", platform: "iOS / macOS", status: "Supported" as const },
  { name: "TalkBack", platform: "Android", status: "Supported" as const },
  { name: "Narrator", platform: "Windows", status: "Partial" as const },
  { name: "Orca", platform: "Linux", status: "Partial" as const },
];

export const KNOWN_LIMITATIONS =
  "Some third-party embedded content (social media posts, interactive maps, partner video players) may not fully meet our accessibility standards. We are working with our suppliers to address these gaps and welcome reports of any barriers you encounter.";

export const ACCESSIBILITY_EMAIL = "accessibility@zbcnews.com";
export const ACCESSIBILITY_PHONE = "+1 (212) 555-0198 ext. 9";
export const ACCESSIBILITY_ADDRESS = "1201 6th Ave, New York, NY";
