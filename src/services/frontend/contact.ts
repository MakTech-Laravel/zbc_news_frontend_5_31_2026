import { request } from "@/api/request";

export type ContactFormPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  subscribe_newsletter?: boolean;
};

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  await request.post("/contact", payload);
}
