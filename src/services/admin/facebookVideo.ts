import { api } from "@/api/client";

type ResolveFacebookVideoResponse = {
  success?: boolean;
  message?: string;
  data?: {
    canonical_url?: string;
    input_url?: string;
  };
};

/** Resolve Facebook share/v short links to a canonical watch/reel URL via backend. */
export async function resolveFacebookShareVideoUrl(rawUrl: string): Promise<string | null> {
  try {
    const response = await api.post<ResolveFacebookVideoResponse>(
      "/admin/facebook-video/resolve",
      { url: rawUrl.trim() },
    );

    const canonical = response.data?.data?.canonical_url;
    return typeof canonical === "string" && canonical.trim() ? canonical.trim() : null;
  } catch {
    return null;
  }
}
