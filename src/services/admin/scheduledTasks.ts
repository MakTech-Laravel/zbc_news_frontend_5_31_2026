import { request } from "@/api/request";

export type ScheduledTaskFailureRow = {
  id: number;
  task_key: string;
  task_name: string;
  task_type: string;
  exception_message: string;
  status: "failed" | "resolved" | "rerun_queued" | string;
  occurrence_count: number;
  failed_at?: string | null;
  resolved_at?: string | null;
  can_rerun: boolean;
};

type ListResponse = {
  items: ScheduledTaskFailureRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function getScheduledTaskApiError(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return String(
      (error as { response?: { data?: { message?: string } } }).response?.data?.message,
    );
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchScheduledTaskFailures(params?: {
  status?: string;
  page?: number;
}): Promise<ListResponse> {
  const response = await request.get("/admin/scheduled-task-failures", { params });
  return unwrapData<ListResponse>(response.data);
}

export async function rerunScheduledTaskFailure(id: number): Promise<void> {
  await request.post(`/admin/scheduled-task-failures/${id}/rerun`);
}

export async function resolveScheduledTaskFailure(id: number): Promise<void> {
  await request.post(`/admin/scheduled-task-failures/${id}/resolve`);
}
