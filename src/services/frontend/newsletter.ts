import { request } from "@/api/request";

export type NewsletterSubscribePayload = {
  email: string;
  name?: string;
  preferences?: string[];
};

export async function subscribeNewsletter(payload: NewsletterSubscribePayload): Promise<void> {
  await request.post("/newsletter/subscribe", payload);
}

