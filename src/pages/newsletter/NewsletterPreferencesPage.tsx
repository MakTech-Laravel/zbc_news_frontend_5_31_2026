import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchNewsletterPreferences,
  updateNewsletterPreferences,
  type NewsletterCategory,
} from "@/services/frontend/newsletter";
import { cn } from "@/lib/utils";

export default function NewsletterPreferencesPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<NewsletterCategory[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    void fetchNewsletterPreferences(token)
      .then((data) => {
        setEmail(data.email);
        setCategories(data.categories ?? []);
        setSelected(data.preferences?.categories ?? []);
      })
      .catch(() => toast.error("Unable to load preferences"))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleCategory(slug: string) {
    setSelected((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      await updateNewsletterPreferences(token, { categories: selected });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-zbc-gray-700">Missing preferences token.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-border bg-background p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-zbc-gray-1000">Newsletter preferences</h1>
        <p className="mt-2 text-sm text-zbc-gray-700">
          {email ? `Manage topics for ${email}.` : "Choose the topics you want to receive."}
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-zbc-gray-500">Loading preferences…</p>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={(e) => void handleSave(e)}>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = selected.includes(category.slug);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.slug)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-zbc-gray-700 hover:border-primary/40",
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save preferences"}
              </button>
              <Link
                to={`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`}
                className="text-sm text-zbc-gray-500 hover:text-zbc-gray-800"
              >
                Unsubscribe from all
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
