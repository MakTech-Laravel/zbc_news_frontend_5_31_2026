import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  previewNewsletterVerification,
  verifyNewsletter,
} from "@/services/frontend/newsletter";

type PageStatus = "loading" | "ready" | "verifying" | "success" | "error";

export default function NewsletterVerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<PageStatus>(token ? "loading" : "error");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "This verification link is missing a token.",
  );
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    void previewNewsletterVerification(token)
      .then((preview) => {
        if (cancelled) {
          return;
        }

        setEmail(preview.email);

        if (preview.status === "verified") {
          setAlreadyVerified(true);
          setStatus("success");
          return;
        }

        if (preview.status === "pending") {
          setStatus("ready");
          return;
        }

        setStatus("error");
        setErrorMessage("This subscription is no longer active.");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "This verification link is invalid or has expired.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleVerify() {
    if (!token || verifyingRef.current || status !== "ready") {
      return;
    }

    verifyingRef.current = true;
    setStatus("verifying");
    setErrorMessage("");

    try {
      const result = await verifyNewsletter(token);
      setEmail(result.email);
      setAlreadyVerified(result.already_verified);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "This verification link is invalid or has already been used.",
      );
    } finally {
      verifyingRef.current = false;
    }
  }

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col justify-center px-4 py-16">
      <div className="rounded-xl border border-border bg-background p-8 text-center shadow-sm">
        {status === "loading" ? (
          <p className="text-sm text-zbc-gray-700">Checking your verification link…</p>
        ) : null}

        {status === "ready" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">Confirm your subscription</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              {email ? (
                <>
                  Confirm the newsletter subscription for <strong>{email}</strong>.
                </>
              ) : (
                "Confirm your email to start receiving newsletters from ZBC News."
              )}
            </p>
            <p className="mt-2 text-xs text-zbc-gray-500">
              This only verifies your newsletter email. You do not need a ZBC News account to
              subscribe.
            </p>
            <button
              type="button"
              onClick={() => void handleVerify()}
              className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm subscription
            </button>
          </>
        ) : null}

        {status === "verifying" ? (
          <p className="text-sm text-zbc-gray-700">Verifying your subscription…</p>
        ) : null}

        {status === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">You&apos;re subscribed</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              {alreadyVerified ? (
                <>
                  {email ? (
                    <>
                      <strong>{email}</strong> is already verified for our newsletter.
                    </>
                  ) : (
                    "Your email is already verified for our newsletter."
                  )}
                </>
              ) : email ? (
                <>
                  <strong>{email}</strong> is now verified.
                </>
              ) : (
                "Your email is now verified."
              )}{" "}
              You&apos;ll start receiving newsletters based on your preferences.
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
              {errorMessage || "This verification link is invalid or has already been used."}
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
