import { request } from "@/api/request";

export type AccessibilityReportPayload = {
  issue: string;
  page_url?: string;
  email?: string;
};

export async function submitAccessibilityReport(payload: AccessibilityReportPayload): Promise<void> {
  await request.post("/accessibility-reports", payload);
}
