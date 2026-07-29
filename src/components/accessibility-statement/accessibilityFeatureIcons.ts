import {
  Eye,
  Keyboard,
  MonitorSmartphone,
  Volume2,
  type LucideIcon,
} from "lucide-react";

const ACCESSIBILITY_FEATURE_ICONS: Record<string, LucideIcon> = {
  Eye,
  Keyboard,
  Volume2,
  MonitorSmartphone,
};

export const ACCESSIBILITY_FEATURE_ICON_OPTIONS = Object.keys(ACCESSIBILITY_FEATURE_ICONS);

export function resolveAccessibilityFeatureIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Eye;
  return ACCESSIBILITY_FEATURE_ICONS[name] ?? Eye;
}
