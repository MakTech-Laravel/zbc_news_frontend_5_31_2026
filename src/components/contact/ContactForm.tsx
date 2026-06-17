import { useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Press / Media",
  "Advertising",
  "Corrections",
  "Technical Support",
] as const;

const fieldClassName =
  "h-[50px] rounded-lg border-admin-input-border bg-white px-[17px] text-base shadow-none placeholder:text-zbc-gray-500/80 focus-visible:border-zbc-blue focus-visible:ring-zbc-blue/30";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-semibold leading-5 text-zbc-gray-1000">
      {children}
      <span className="text-admin-notification"> *</span>
    </label>
  );
}

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Your message has been sent. We'll get back to you soon.");
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubscribeNewsletter(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold leading-8 text-zbc-gray-1000">Send Us a Message</h2>
      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div>
          <RequiredLabel>Full Name</RequiredLabel>
          <Input
            className={fieldClassName}
            placeholder="John Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>

        <div>
          <RequiredLabel>Email Address</RequiredLabel>
          <Input
            type="email"
            className={fieldClassName}
            placeholder="john@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <RequiredLabel>Subject</RequiredLabel>
          <select
            className={cn(
              fieldClassName,
              "w-full appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
              !subject && "text-zbc-gray-500/80",
            )}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
          >
            <option value="" disabled>
              Select a subject
            </option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option} className="text-zbc-gray-1000">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <RequiredLabel>Message</RequiredLabel>
          <textarea
            className="min-h-[146px] w-full resize-y rounded-lg border border-admin-input-border bg-white px-[17px] py-[13px] text-base leading-6 text-zbc-gray-1000 shadow-none placeholder:text-zbc-gray-500/80 focus-visible:border-zbc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue/30"
            placeholder="Tell us how we can help..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-5 rounded border-admin-input-border text-zbc-blue focus:ring-zbc-blue/30"
            checked={subscribeNewsletter}
            onChange={(event) => setSubscribeNewsletter(event.target.checked)}
          />
          <span className="text-sm font-medium leading-5 text-[#364153]">
            Subscribe to ZBC newsletter and get daily news delivered to your inbox
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-zbc-blue px-8 text-base font-bold text-white shadow-md transition-colors hover:bg-zbc-blue/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send className="size-5" strokeWidth={2.2} />
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
