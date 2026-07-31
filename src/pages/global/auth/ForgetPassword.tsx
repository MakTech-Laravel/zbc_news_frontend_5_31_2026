import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  isTurnstileRequired,
  TurnstileWidget,
} from "@/components/auth/TurnstileWidget";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";
import { requestPasswordResetOtp } from "@/features/auth/service";
import { type AuthRole } from "@/features/auth/types";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [role] = React.useState<AuthRole>("user");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isTurnstileRequired() && !captchaToken) {
      setError("Please complete the bot verification check.");
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await requestPasswordResetOtp({
        email: normalizedEmail,
        ...(captchaToken ? { captcha_token: captchaToken } : {}),
      });

      toast.success("If an account exists for that email, a reset code has been sent.");
      navigate(
        `/otp-verification?purpose=reset&email=${encodeURIComponent(normalizedEmail)}`,
        { replace: true },
      );
    } catch (err) {
      setError(getAuthErrorMessage(err, "Unable to process your request. Please try again."));
      toast.error(getAuthErrorMessage(err, "Unable to process your request. Please try again."));
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-auth-bg p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-inter font-semibold text-foreground mb-2">
                Forget Password
              </h2>
              <p className="text-base font-inter font-normal text-muted-foreground text-center">
                Enter the email address associated with your account.
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <TurnstileWidget onTokenChange={setCaptchaToken} />

              {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="my-7">
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                  className="flex justify-center w-full h-11 rounded-lg bg-brand px-6 text-base font-medium text-ice shadow-none hover:bg-brand/90"
                >
                  <span className="inline-flex items-center gap-2 bg-brand">
                    {loading ? "Sending..." : "Send Code"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-2 mb-2">
              <p className="text-base font-inter font-normal text-muted-foreground">
                Already have account?
              </p>
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
            <div className="flex items-center gap-2 mb-5">
              <p className="text-base font-inter font-normal text-muted-foreground">
                Don't have an account?
              </p>
              <Link to={`/register?role=${role}`} className="text-primary hover:underline">
                Sign Up
              </Link>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm"></div>
            </div>

            <div>
              <p className="text-base font-inter font-normal text-muted-foreground">
                You may contact{" "}
                <Link to="#" className="text-lg text-brand-red">
                  Customer Service
                </Link>{" "}
                for help restoring access to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
