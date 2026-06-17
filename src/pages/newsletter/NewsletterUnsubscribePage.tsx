import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { unsubscribeNewsletter } from "@/services/frontend/newsletter";

export default function NewsletterUnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    void unsubscribeNewsletter(token)
      .then((result) => {
        setEmail(result.email);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-border bg-background p-8 text-center shadow-sm">
        {status === "loading" ? (
          <p className="text-sm text-zbc-gray-700">Processing your request…</p>
        ) : null}

        {status === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">You&apos;ve been unsubscribed</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              {email ? `${email} will no longer receive newsletters.` : "You will no longer receive newsletters."}
            </p>
            {token ? (
              <Link
                to={`/newsletter/preferences?token=${encodeURIComponent(token)}`}
                className="mt-4 inline-block text-sm text-primary"
              >
                Manage preferences instead
              </Link>
            ) : null}
          </>
        ) : null}

        {status === "error" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">Unsubscribe failed</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">This unsubscribe link is invalid.</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
