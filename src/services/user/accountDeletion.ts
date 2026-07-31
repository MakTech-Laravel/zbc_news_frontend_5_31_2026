import { request } from "@/api/request";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";

export async function requestAccountDeletion(payload: {
  password: string;
  confirm: boolean;
}): Promise<{ scheduled_permanent_deletion_at?: string; grace_days?: number }> {
  const response = await request.post("/auth/account/delete", {
    password: payload.password,
    confirm: payload.confirm ? 1 : 0,
  });
  const body = response.data as { data?: Record<string, unknown> };
  const data = body.data ?? {};
  return {
    scheduled_permanent_deletion_at:
      typeof data.scheduled_permanent_deletion_at === "string"
        ? data.scheduled_permanent_deletion_at
        : undefined,
    grace_days: typeof data.grace_days === "number" ? data.grace_days : undefined,
  };
}

export async function cancelAccountDeletion(token: string): Promise<void> {
  await request.post("/auth/account/cancel-deletion", { token });
}

export function getAccountDeletionError(error: unknown, fallback: string): string {
  return getAuthErrorMessage(error, fallback);
}
