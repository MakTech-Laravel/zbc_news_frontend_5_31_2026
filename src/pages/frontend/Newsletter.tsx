import { Mail } from "lucide-react";

import { NewsletterSignupForm } from "@/components/newsletter/NewsletterSignupForm";
import { useDocumentHead } from "@/hooks/useDocumentHead";

export default function NewsletterPage() {
  useDocumentHead({
    path: "/newsletter",
    description:
      "Subscribe to the ZBC News daily newsletter for top headlines and category updates tailored to your interests.",
  });

  return (
    <div className="bg-white">
      <section className="border-b border-zbc-gray-200 bg-linear-to-br from-zbc-gray-50 to-brand-soft py-16 md:py-20">
        <div className="mx-auto container px-4 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-6" aria-hidden />
          </div>
          <h1 className="font-inter text-4xl font-bold leading-tight text-zbc-gray-1000 md:text-5xl">
            Daily Newsletter
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-lg leading-7 text-admin-label">
            Get the top stories delivered to your inbox every morning. Choose the
            categories you care about and subscribe in seconds.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto container max-w-xl px-4">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
            <NewsletterSignupForm
              variant="inline"
              source="newsletter-page"
              showCategories
              title="Subscribe"
              description="Enter your email and pick topics. We will send a verification link to confirm your subscription."
            />
          </div>

          <p className="mt-6 text-center font-inter text-sm text-admin-label">
            Already subscribed? Check your inbox for preference and unsubscribe links
            included in every email.
          </p>
        </div>
      </section>
    </div>
  );
}
