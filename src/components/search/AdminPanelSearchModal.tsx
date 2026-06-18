import * as React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  FolderTree,
  Image,
  Loader2,
  MessageSquare,
  Search,
  Users,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdminSearch } from "@/hooks/useAdminSearch";

type AdminPanelSearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seedQuery?: string;
  onQueryChange?: (query: string) => void;
};

function ResultLink({
  to,
  title,
  subtitle,
  onNavigate,
}: {
  to: string;
  title: string;
  subtitle?: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="block rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/40"
    >
      <p className="line-clamp-1 text-sm font-medium text-admin-heading">{title}</p>
      {subtitle ? (
        <p className="mt-0.5 line-clamp-1 text-xs text-admin-label">{subtitle}</p>
      ) : null}
    </Link>
  );
}

export function AdminPanelSearchModal({
  open,
  onOpenChange,
  seedQuery = "",
  onQueryChange,
}: AdminPanelSearchModalProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { query, setQuery, results, searching, error, minQueryLength } = useAdminSearch(open);

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= minQueryLength;

  React.useEffect(() => {
    if (!open) return;
    setQuery(seedQuery);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, seedQuery, setQuery]);

  function handleQueryChange(value: string) {
    setQuery(value);
    onQueryChange?.(value);
  }

  function close() {
    onOpenChange(false);
  }

  const sections = [
    {
      key: "articles",
      label: "Articles",
      icon: FileText,
      items: results.articles.map((item) => ({
        id: item.id,
        to: `/admin/articles/edit/${encodeURIComponent(item.slug)}`,
        title: item.title,
        subtitle: [item.status, item.author].filter(Boolean).join(" · "),
      })),
    },
    {
      key: "users",
      label: "Users",
      icon: Users,
      items: results.users.map((item) => ({
        id: item.id,
        to: "/admin/users",
        title: item.name,
        subtitle: item.email,
      })),
    },
    {
      key: "categories",
      label: "Categories",
      icon: FolderTree,
      items: results.categories.map((item) => ({
        id: item.id,
        to: "/admin/categories",
        title: item.title,
        subtitle: `/${item.slug}`,
      })),
    },
    {
      key: "media",
      label: "Media",
      icon: Image,
      items: results.media.map((item) => ({
        id: item.id,
        to: "/admin/media",
        title: item.name,
        subtitle: item.mime_type,
      })),
    },
    {
      key: "comments",
      label: "Comments",
      icon: MessageSquare,
      items: results.comments.map((item) => ({
        id: item.id,
        to: "/admin/comments",
        title: item.body,
        subtitle: [item.author, item.article_title].filter(Boolean).join(" · "),
      })),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(85vh,720px)] gap-0 overflow-hidden border-border p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-0 border-b border-border px-4 pb-4 pt-5 sm:px-6">
          <DialogTitle className="text-lg font-semibold text-admin-heading">
            Search Admin Panel
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search articles, users, categories, media, and comments
          </DialogDescription>

          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-label"
              aria-hidden
            />
            <Input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search articles, users, media..."
              className="h-11 w-full rounded-[10px] border-admin-input-border pl-10 text-sm"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[min(58vh,520px)] overflow-y-auto px-4 py-4 sm:px-6">
          {!showResults ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-admin-label">
              Type at least {minQueryLength} characters to search the admin panel.
            </p>
          ) : error ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : searching && results.total === 0 ? (
            <div className="flex items-center gap-2 py-6 text-sm text-admin-label">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Searching…
            </div>
          ) : results.total === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-admin-label">
              No results found for &ldquo;{trimmedQuery}&rdquo;.
            </p>
          ) : (
            <div className="space-y-5">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <section key={section.key} aria-label={section.label}>
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="size-4 text-admin-label" aria-hidden />
                      <h3 className="text-sm font-semibold text-admin-heading">{section.label}</h3>
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <ResultLink
                          key={item.id}
                          to={item.to}
                          title={item.title}
                          subtitle={item.subtitle}
                          onNavigate={close}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
