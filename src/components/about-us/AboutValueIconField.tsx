import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isValidLucideIconName,
  LUCIDE_ICON_NAMES,
  normalizeLucideIconName,
  previewAboutValueIcon,
} from "@/components/about-us/aboutValueIcons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 96;

type AboutValueIconFieldProps = {
  value: string;
  disabled?: boolean;
  onChange: (icon: string) => void;
};

export function AboutValueIconField({ value, disabled, onChange }: AboutValueIconFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const Icon = previewAboutValueIcon(value);
  const displayName = normalizeLucideIconName(value) || value || "ShieldCheck";
  const valid = isValidLucideIconName(value || "ShieldCheck");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[-_\s]+/g, "");
    if (!q) return LUCIDE_ICON_NAMES.slice(0, MAX_VISIBLE);

    const matches: string[] = [];
    for (const name of LUCIDE_ICON_NAMES) {
      if (name.toLowerCase().includes(q)) {
        matches.push(name);
        if (matches.length >= MAX_VISIBLE) break;
      }
    }
    return matches;
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      queueMicrotask(() => searchRef.current?.focus());
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative space-y-2">
      <span className="block text-xs font-medium text-admin-label">Icon</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-12 items-center justify-center rounded-full bg-[#dbeafe] text-zbc-blue disabled:opacity-60"
        title="Search Lucide icons"
        aria-expanded={open}
      >
        <Icon className="size-6" strokeWidth={2.2} />
      </button>
      <p className={cn("text-xs", valid ? "text-admin-label" : "text-red-600")}>
        {displayName}
        {!valid ? " (unknown — falls back to ShieldCheck)" : null}
      </p>

      {open && !disabled ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-admin-input-border bg-admin-surface p-3 shadow-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-admin-label" />
            <Input
              ref={searchRef}
              value={query}
              placeholder="Search Lucide icons…"
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <p className="mt-2 text-[11px] text-admin-label">
            Any icon from{" "}
            <a
              href="https://lucide.dev/icons/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zbc-blue underline-offset-2 hover:underline"
            >
              lucide.dev/icons
            </a>
          </p>
          <div className="mt-2 grid max-h-56 grid-cols-6 gap-1 overflow-y-auto sm:grid-cols-8">
            {filtered.map((name) => {
              const OptionIcon = previewAboutValueIcon(name);
              const selected = normalizeLucideIconName(value) === name;

              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-md text-admin-heading hover:bg-[#dbeafe] hover:text-zbc-blue",
                    selected && "bg-[#dbeafe] text-zbc-blue ring-1 ring-zbc-blue/40",
                  )}
                >
                  <OptionIcon className="size-4" strokeWidth={2} />
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-admin-label">No icons match “{query}”.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
