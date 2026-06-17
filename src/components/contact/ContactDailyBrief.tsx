import { useState } from "react";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";

import { subscribeNewsletter } from "@/services/frontend/newsletter";
import { getAuthErrorMessage } from "@/features/auth/errorMessage";

export function ContactDailyBrief() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await subscribeNewsletter({ email: email.trim(), source: "contact-page" });
      toast.success("Subscription received. Please verify your email.");
      setEmail("");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Unable to subscribe right now. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-linear-to-r from-zbc-blue to-[#1447e6] py-16 md:py-20">
      <div className="mx-auto container px-4 text-center">
        <Mail className="mx-auto size-12 text-white" strokeWidth={1.8} />
        <h2 className="mt-4 text-3xl font-bold leading-9 text-white">Get the ZBC Daily Brief</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-[#dbeafe]">
          Top stories delivered to your inbox every morning — free, no spam
        </p>
        <form
          className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 flex-1 rounded-lg border border-white/20 bg-transparent px-[17px] text-base text-white placeholder:text-white/80 focus-visible:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-zbc-blue transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
