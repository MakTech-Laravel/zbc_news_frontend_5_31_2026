import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyNewsletter } from "@/services/frontend/newsletter";

export default function NewsletterVerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    void verifyNewsletter(token)
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
          <p className="text-sm text-zbc-gray-700">Verifying your subscription…</p>
        ) : null}

        {status === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">You&apos;re subscribed</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              {email ? `${email} is now verified.` : "Your email is now verified."} You&apos;ll start
              receiving newsletters based on your preferences.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Back to homepage
            </Link>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">Verification failed</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              This verification link is invalid or has already been used.
            </p>
            <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary">
              Return home
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
