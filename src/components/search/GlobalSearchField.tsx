import * as React from "react";
import { Clock, History, Loader2, Newspaper, Search, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import { FreshnessIndicator } from "@/components/main-layout/shared/FreshnessIndicator";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { getArticleFreshnessIso } from "@/lib/relativeTime";
import { cn } from "@/lib/utils";

type GlobalSearchFieldProps = {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  "aria-label"?: string;
};

export function GlobalSearchField({
  className,
  inputClassName,
  placeholder = "Search news, topics...",
  "aria-label": ariaLabel = "Search news",
}: GlobalSearchFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const panelId = React.useId();
  const [open, setOpen] = React.useState(false);

  const {
    query,
    setQuery,
    results,
    history,
    searching,
    historyLoading,
    error,
    recordSearch,
    clearHistory,
    minQueryLength,
  } = useGlobalSearch(open);

  const trimmedQuery = query.trim();
  const showResults = trimmedQuery.length >= minQueryLength;
  const showHistorySection = !showResults || history.length > 0;

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleHistoryClick(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  function handleResultNavigate(term: string) {
    void recordSearch(term);
    setOpen(false);
  }

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-zbc-gray-400"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-full border-border bg-muted pl-10 pr-10 font-sans text-[13px] text-foreground shadow-none placeholder:text-zbc-gray-400 focus-visible:border-zbc-gray-200 focus-visible:ring-2 focus-visible:ring-primary/30",
          inputClassName,
        )}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={panelId}
        autoComplete="off"
      />
      {query ? (
        <button
          type="button"
          onClick={clearQuery}
          className="absolute right-3 top-1/2 z-10 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-zbc-gray-400 transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}

      {open ? (
        <div
          id={panelId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[60] overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <div className="max-h-[min(70vh,520px)] overflow-y-auto px-3 py-3 sm:px-4">
            {showHistorySection ? (
              <section aria-label="Recent searches">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                    <History className="size-4 text-muted-foreground" aria-hidden />
                    Recent Searches
                  </h3>
                  {history.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => void clearHistory()}
                      className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Clear
                    </button>
                  ) : null}
                </div>

                {historyLoading ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Loading history…
                  </div>
                ) : history.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                    Your recent searches will appear here.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {history.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleHistoryClick(item.query)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                        >
                          <span className="inline-flex min-w-0 items-center gap-2.5">
                            <Clock className="size-4 shrink-0 text-zbc-gray-400" aria-hidden />
                            <span className="truncate font-sans text-sm font-medium text-foreground">
                              {item.query}
                            </span>
                          </span>
                          <span className="shrink-0 font-sans text-xs text-muted-foreground">
                            {item.searched_at}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {showResults ? (
              <section
                aria-label="Search results"
                className={cn(showHistorySection && "mt-6")}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                    <Newspaper className="size-4 text-muted-foreground" aria-hidden />
                    Results
                  </h3>
                  {searching ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                  ) : (
                    <span className="font-sans text-xs text-muted-foreground">
                      {results.length} found
                    </span>
                  )}
                </div>

                {error ? (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </p>
                ) : searching && results.length === 0 ? (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Searching…
                  </div>
                ) : results.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                    No articles found for &ldquo;{trimmedQuery}&rdquo;.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {results.map((article) => {
                      const freshnessIso = getArticleFreshnessIso(article);

                      return (
                        <li key={article.id}>
                          <Link
                            to={
                              article.slug
                                ? `/${encodeURIComponent(article.slug)}`
                                : "/"
                            }
                            onClick={() => handleResultNavigate(trimmedQuery)}
                            className="flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
                          >
                            <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted sm:size-20">
                              {article.imageUrl ? (
                                <ArticleImage
                                  src={article.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <Newspaper className="size-5" aria-hidden />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="inline-flex rounded bg-muted px-2 py-0.5 font-sans text-[11px] font-medium text-muted-foreground">
                                {article.category}
                              </span>
                              <h4 className="mt-1 line-clamp-2 font-sans text-sm font-semibold leading-5 text-foreground">
                                {article.title}
                              </h4>
                              {article.excerpt ? (
                                <p className="mt-1 line-clamp-2 font-sans text-xs leading-5 text-muted-foreground">
                                  {article.excerpt}
                                </p>
                              ) : null}
                              <p className="mt-2 font-sans text-[11px] text-muted-foreground">
                                {freshnessIso ? (
                                  <FreshnessIndicator
                                    dateTime={freshnessIso}
                                    fallback={article.publishedAt}
                                  />
                                ) : (
                                  article.publishedAt
                                )}
                                {article.readTime ? ` · ${article.readTime}` : ""}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
