import {
  Bolt,
  Eye,
  Globe,
  Heart,
  Lightbulb,
  Newspaper,
  Scale,
  Shield,
  ShieldCheck,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

const ABOUT_VALUE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Bolt,
  Eye,
  Shield,
  Globe,
  Heart,
  Lightbulb,
  Newspaper,
  Scale,
  Target,
  Users,
};

export function resolveAboutValueIcon(name: string | undefined | null): LucideIcon {
  if (!name) return ShieldCheck;
  return ABOUT_VALUE_ICONS[name] ?? ShieldCheck;
}

export function previewAboutValueIcon(name: string | undefined | null): LucideIcon {
  return resolveAboutValueIcon(name);
}
