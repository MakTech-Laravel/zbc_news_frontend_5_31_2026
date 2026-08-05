import * as React from "react";
import { ArrowRight, Eye } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isTurnstileRequired,
  TurnstileWidget,
} from "@/components/auth/TurnstileWidget";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";
import {
  getPasswordValidationError,
  PASSWORD_REQUIREMENTS,
} from "@/features/auth/passwordValidation";
import { resolveAuthRole, saveAuthRole } from "@/features/auth/roleSelection";
import { registerUser } from "@/features/auth/service";
import { type AuthRole } from "@/features/auth/types";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [role, setRole] = React.useState<AuthRole>("user");
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    const selectedRole = resolveAuthRole(searchParams.get("role"));
    setRole(selectedRole);
    saveAuthRole(selectedRole);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password and confirmation do not match.");
      return;
    }

    if (isTurnstileRequired() && !captchaToken) {
      setError("Please complete the bot verification check.");
      return;
    }

    setLoading(true);
    saveAuthRole(role);

    try {
      await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        role,
        accepted_terms: true,
        ...(captchaToken ? { captcha_token: captchaToken } : {}),
      });

      const normalizedEmail = email.trim().toLowerCase();
      setSuccess("Registration successful. Please verify your email.");
      navigate(
        `/otp-verification?purpose=register&email=${encodeURIComponent(normalizedEmail)}&role=${role}`,
        { replace: true },
      );
    } catch (err) {
      setError(getAuthErrorMessage(err, "Registration failed. Please try again."));
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-bg p-4">
      <div className="max-w-2xl w-full bg-card p-8 rounded-lg shadow-lg">
        <div className="space-y-6">
          <div className="text-left mb-8">
            <h2 className="text-2xl font-inter font-semibold text-foreground mb-2">
              Welcome to ZBC News
            </h2>
            <p className="text-sm font-inter text-muted-foreground">
              Already have an account?{" "}
              <Link to={`/login/email?role=${role}`} className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal text-muted-foreground mb-2">
                  First Name <span className="text-brand-red">*</span>
                </label>
                <Input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-muted-foreground mb-2">
                  Last Name <span className="text-brand-red">*</span>
                </label>
                <Input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal text-muted-foreground mb-2">
                  Email <span className="text-brand-red">*</span>
                </label>
                <Input
                  type="email"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-muted-foreground mb-2">
                  Phone Number <span className="text-brand-red">*</span>
                </label>
                <Input
                  type="tel"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal text-muted-foreground mb-2">
                Password <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {PASSWORD_REQUIREMENTS.map((requirement) => {
                  const met = requirement.test(password);
                  return (
                    <li
                      key={requirement.id}
                      className={`text-xs ${
                        met ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {met ? "✓" : "•"} {requirement.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-normal text-muted-foreground mb-2">
                Confirm Password <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            <TurnstileWidget onTokenChange={setCaptchaToken} className="my-2" />

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="my-7">
              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="flex justify-center max-w-xs w-full h-11 rounded-lg bg-brand px-6 text-base font-medium text-ice shadow-none hover:bg-brand/90"
              >
                <span className="inline-flex items-center gap-2">
                  {loading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
