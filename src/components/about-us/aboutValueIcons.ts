import { icons, ShieldCheck, type LucideIcon } from "lucide-react";

/** PascalCase names from lucide-react (`icons` map). */
export const LUCIDE_ICON_NAMES = Object.keys(icons).sort((a, b) => a.localeCompare(b));

/**
 * Accepts PascalCase (`ShieldCheck`) or kebab-case from lucide.dev (`shield-check`).
 */
export function normalizeLucideIconName(name: string | undefined | null): string {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return "";

  if (/^[A-Z][A-Za-z0-9]*$/.test(trimmed)) return trimmed;

  return trimmed
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

export function resolveAboutValueIcon(name: string | undefined | null): LucideIcon {
  const key = normalizeLucideIconName(name);
  if (!key) return ShieldCheck;

  const Icon = icons[key as keyof typeof icons];
  return (Icon as LucideIcon | undefined) ?? ShieldCheck;
}

export function previewAboutValueIcon(name: string | undefined | null): LucideIcon {
  return resolveAboutValueIcon(name);
}

export function isValidLucideIconName(name: string | undefined | null): boolean {
  const key = normalizeLucideIconName(name);
  return Boolean(key && icons[key as keyof typeof icons]);
}
