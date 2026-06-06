import { env } from "@/config/env";

function getApiOrigin(): string {
  try {
    return new URL(env.apiBaseUrl).origin;
  } catch {
    return "";
  }
}

/** Turn API storage paths (`/storage/...`) into absolute URLs on the backend host. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path?.trim()) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const origin = getApiOrigin();
  if (!origin) return path;

  return path.startsWith("/") ? `${origin}${path}` : `${origin}/${path}`;
}
