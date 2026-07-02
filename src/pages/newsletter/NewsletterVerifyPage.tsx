import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyNewsletter } from "@/services/frontend/newsletter";

type PageStatus = "ready" | "loading" | "success" | "error";

export default function NewsletterVerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<PageStatus>(token ? "ready" : "error");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "This verification link is missing a token.",
  );
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const verifyingRef = useRef(false);

  async function handleVerify() {
    if (!token || verifyingRef.current) {
      return;
    }

    verifyingRef.current = true;
    setStatus("loading");
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
        {status === "ready" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">Confirm your subscription</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              Click the button below to verify your email and start receiving newsletters from ZBC
              News.
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

        {status === "loading" ? (
          <p className="text-sm text-zbc-gray-700">Verifying your subscription…</p>
        ) : null}

        {status === "success" ? (
          <>
            <h1 className="text-2xl font-bold text-zbc-gray-1000">You&apos;re subscribed</h1>
            <p className="mt-3 text-sm text-zbc-gray-700">
              {alreadyVerified
                ? "Your email was already verified."
                : email
                  ? `${email} is now verified.`
                  : "Your email is now verified."}{" "}
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
