import { request } from "@/api/request";

export type AccessibilityReportStatus = "new" | "reviewed" | "resolved";

export type AccessibilityReport = {
  id: string;
  issue: string;
  issuePreview?: string;
  pageUrl?: string | null;
  email?: string | null;
  status: AccessibilityReportStatus;
  statusLabel: string;
  submittedAt?: string | null;
  submittedAtLabel?: string;
  resolvedAt?: string | null;
  resolvedAtLabel?: string | null;
};

export type AccessibilityReportsListResponse = {
  reports: AccessibilityReport[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function mapReport(raw: Record<string, unknown>): AccessibilityReport {
  return {
    id: String(raw.id ?? ""),
    issue: String(raw.issue ?? ""),
    issuePreview: (raw.issuePreview as string | undefined) ?? undefined,
    pageUrl: (raw.pageUrl as string | null | undefined) ?? null,
    email: (raw.email as string | null | undefined) ?? null,
    status: (raw.status as AccessibilityReportStatus) ?? "new",
    statusLabel: String(raw.statusLabel ?? "New"),
    submittedAt: (raw.submittedAt as string | null | undefined) ?? null,
    submittedAtLabel: String(raw.submittedAtLabel ?? ""),
    resolvedAt: (raw.resolvedAt as string | null | undefined) ?? null,
    resolvedAtLabel: (raw.resolvedAtLabel as string | null | undefined) ?? null,
  };
}

export async function fetchAdminAccessibilityReports(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<AccessibilityReportsListResponse> {
  const response = await request.get("/admin/accessibility-reports", { params });
  const root = response.data as Record<string, unknown>;
  const rows = Array.isArray(root.data) ? root.data : [];
  const meta = (root.meta ?? {}) as AccessibilityReportsListResponse["meta"];

  return {
    reports: rows.map((row) => mapReport(row as Record<string, unknown>)),
    meta: {
      current_page: Number(meta.current_page ?? 1),
      last_page: Number(meta.last_page ?? 1),
      per_page: Number(meta.per_page ?? 15),
      total: Number(meta.total ?? rows.length),
    },
  };
}

export async function updateAccessibilityReportStatus(
  id: string,
  status: AccessibilityReportStatus,
): Promise<void> {
  await request.patch(`/admin/accessibility-reports/${id}/status`, { status });
}
