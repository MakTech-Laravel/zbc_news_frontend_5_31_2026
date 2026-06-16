import { request } from "@/api/request";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export type PublicAdSlot = {
  slot_key: string;
  provider: "google" | "manual";
  google_ad_client?: string | null;
  google_ad_slot?: string | null;
  manual_image_url?: string | null;
  manual_click_url?: string | null;
  manual_html?: string | null;
};

function normalizePublicAdSlot(slot: PublicAdSlot): PublicAdSlot {
  return {
    ...slot,
    manual_image_url: slot.manual_image_url
      ? resolveMediaUrl(slot.manual_image_url)
      : slot.manual_image_url,
  };
}

export async function fetchPublicAdSlots(): Promise<Record<string, PublicAdSlot>> {
  const response = await request.get("/ads/slots");
  const payload = response.data?.data;
  if (!payload || typeof payload !== "object") return {};

  const entries = Object.entries(payload as Record<string, PublicAdSlot>);
  return Object.fromEntries(
    entries.map(([key, slot]) => [key, normalizePublicAdSlot(slot)]),
  );
}

