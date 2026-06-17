import { request } from "@/api/request";

export type NewsletterCategory = {
  id: number;
  name: string;
  slug: string;
};

export type NewsletterSubscribePayload = {
  email: string;
  name?: string;
  preferences?: string[] | { categories: string[] };
  source?: string;
};

export type NewsletterPreferencesResponse = {
  email: string;
  name?: string | null;
  preferences?: { categories?: string[] } | null;
  categories: NewsletterCategory[];
};

function extractData<T>(body: unknown): T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid API response");
  }
  const root = body as Record<string, unknown>;
  if (root.success === false) {
    throw new Error(typeof root.message === "string" ? root.message : "Request failed");
  }
  return (root.data ?? root) as T;
}

export async function subscribeNewsletter(payload: NewsletterSubscribePayload): Promise<void> {
  await request.post("/newsletter/subscribe", payload);
}

export async function verifyNewsletter(token: string): Promise<{ email: string }> {
  const response = await request.get("/newsletter/verify", { params: { token } });
  return extractData<{ email: string }>(response.data);
}

export async function unsubscribeNewsletter(token: string): Promise<{ email: string }> {
  const response = await request.get("/newsletter/unsubscribe", { params: { token } });
  return extractData<{ email: string }>(response.data);
}

export async function fetchNewsletterPreferences(token: string): Promise<NewsletterPreferencesResponse> {
  const response = await request.get("/newsletter/preferences", { params: { token } });
  return extractData<NewsletterPreferencesResponse>(response.data);
}

export async function updateNewsletterPreferences(
  token: string,
  preferences: { categories: string[] },
): Promise<void> {
  await request.put("/newsletter/preferences", { token, preferences });
}

export async function fetchNewsletterCategories(): Promise<NewsletterCategory[]> {
  const response = await request.get("/newsletter/categories");
  const data = extractData<NewsletterCategory[]>(response.data);
  return Array.isArray(data) ? data : [];
}
