import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  cancelAccountDeletion,
  getAccountDeletionError,
} from "@/services/user/accountDeletion";

export default function CancelAccountDeletion() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") ?? "").trim();
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">(
    token ? "idle" : "error",
  );
  const [message, setMessage] = React.useState(
    token
      ? "Click the button below to send a cancellation request to an administrator. Your account stays disabled until an admin restores it."
      : "This cancellation link is missing a token. Open the link from your email.",
  );

  async function submitCancelRequest() {
    if (!token) return;
    setStatus("loading");
    try {
      await cancelAccountDeletion(token);
      setStatus("success");
      setMessage(
        "Your cancellation request was sent to an administrator. You will be able to sign in again after an admin reviews and restores your account. Your account will not be permanently deleted while this request is pending.",
      );
      toast.success("Cancellation request sent to admin");
    } catch (error) {
      setStatus("error");
      setMessage(getAccountDeletionError(error, "Unable to send cancellation request."));
      toast.error(getAccountDeletionError(error, "Unable to send cancellation request."));
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-zbc-gray-1000">Cancel account deletion</h1>
      <p className="mt-3 text-sm leading-relaxed text-zbc-gray-600">{message}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {status === "idle" || status === "error" ? (
          <>
            {token ? (
              <button
                type="button"
                onClick={() => void submitCancelRequest()}
                disabled={status === "loading"}
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {status === "loading" ? "Sending…" : "Send cancel request to admin"}
              </button>
            ) : null}
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium"
            >
              Back to home
            </Link>
          </>
        ) : null}

        {status === "loading" ? (
          <p className="text-sm text-zbc-gray-500">Sending your request to an administrator…</p>
        ) : null}

        {status === "success" ? (
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium"
          >
            Back to home
          </Link>
        ) : null}
      </div>
    </div>
  );
}
