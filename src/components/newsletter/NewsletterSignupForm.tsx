import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  fetchNewsletterCategories,
  subscribeNewsletter,
  type NewsletterCategory,
} from "@/services/frontend/newsletter";

type NewsletterSignupFormProps = {
  source?: string;
  title?: string;
  description?: string;
  showCategories?: boolean;
  variant?: "sidebar" | "footer" | "inline";
  className?: string;
};

export function NewsletterSignupForm({
  source = "website",
  title = "Daily Newsletter",
  description = "Get the top stories delivered to your inbox every morning.",
  showCategories = false,
  variant = "sidebar",
  className,
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<NewsletterCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!showCategories) return;
    void fetchNewsletterCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [showCategories]);

  function toggleCategory(slug: string) {
    setSelectedCategories((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await subscribeNewsletter({
        email: email.trim(),
        name: name.trim() || undefined,
        source,
        preferences:
          selectedCategories.length > 0 ? { categories: selectedCategories } : undefined,
      });
      toast.success("Subscription received. Please verify your email.");
      setEmail("");
      setName("");
      setSelectedCategories([]);
    } catch {
      toast.error("Unable to subscribe right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isFooter = variant === "footer";

  return (
    <div className={cn(className)}>
      <div className={cn("mb-3", isFooter && "mb-4")}>
        <div className="mb-3 flex items-center gap-2">
          <Mail className={cn("text-primary", isFooter ? "size-5" : "size-5")} />
          <h2
            className={cn(
              "font-inter font-bold text-zbc-gray-1000",
              isFooter ? "text-base" : "text-sm",
            )}
          >
            {title}
          </h2>
        </div>
        <p
          className={cn(
            "font-inter text-zbc-gray-700",
            isFooter ? "text-sm text-[#cbd5e1]" : "text-xs",
          )}
        >
          {description}
        </p>
      </div>

      <form className="space-y-2" onSubmit={(e) => void handleSubmit(e)}>
        {showCategories && categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = selectedCategories.includes(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.slug)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-zbc-gray-700 hover:border-primary/40",
                    isFooter && "border-[#334155] text-[#cbd5e1]",
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        ) : null}

        {variant === "inline" ? (
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-xs border-border bg-input font-inter text-xs"
          />
        ) : null}

        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={cn(
            "h-10 rounded-xs border-border font-inter text-xs text-foreground",
            isFooter ? "border-[#334155] bg-[#0f172a] text-white placeholder:text-[#64748b]" : "bg-input",
          )}
        />

        <Button
          type="submit"
          disabled={submitting}
          className={cn(
            "w-full rounded-none bg-primary font-inter text-xs font-bold text-primary-foreground hover:bg-bg-primary-500",
            isFooter && "h-10",
          )}
        >
          {submitting ? "Subscribing..." : "Subscribe Now"}
        </Button>
      </form>
    </div>
  );
}
