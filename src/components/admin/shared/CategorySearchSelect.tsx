import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type CategorySearchOption = {
  id: string;
  title: string;
  /** Display label (may include parent / child). Sorted A–Z by this. */
  label: string;
  status?: string | { value?: string } | null;
};

type CategorySearchSelectProps = {
  options: CategorySearchOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** When true, only options with status === "active" (or missing status) are shown. */
  activeOnly?: boolean;
};

function normalizeStatus(status: CategorySearchOption["status"]): string | undefined {
  if (status == null) return undefined;
  if (typeof status === "string") return status.trim().toLowerCase();
  if (typeof status === "object" && typeof status.value === "string") {
    return status.value.trim().toLowerCase();
  }
  return undefined;
}

function isActiveOption(option: CategorySearchOption): boolean {
  const status = normalizeStatus(option.status);
  return !status || status === "active";
}

export function CategorySearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select category",
  className,
  activeOnly = true,
}: CategorySearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const sorted = React.useMemo(() => {
    const filtered = activeOnly ? options.filter(isActiveOption) : options;
    return [...filtered].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
  }, [options, activeOnly]);

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const selected = sorted.find((o) => o.id === value) ?? options.find((o) => o.id === value);

  const updateMenuPosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = 280;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: Math.max(rect.width, 220),
      top: openUp ? undefined : rect.bottom + gap,
      bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
      zIndex: 80,
    });
  }, []);

  React.useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
      setSearch("");
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, updateMenuPosition]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="overflow-hidden rounded-md border border-admin-input-border bg-white shadow-md"
          >
            <div className="flex items-center gap-2 border-b border-admin-input-border px-2">
              <Search className="size-4 shrink-0 text-admin-label" aria-hidden />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpen(false);
                    setSearch("");
                    triggerRef.current?.focus();
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const first = visible[0];
                    if (first) {
                      onChange(first.id);
                      setOpen(false);
                      setSearch("");
                    }
                  }
                }}
                placeholder="Search categories…"
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
              />
            </div>
            <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
              {visible.length === 0 ? (
                <li className="px-3 py-2 text-sm text-admin-label">No categories found</li>
              ) : (
                visible.map((option) => {
                  const isSelected = option.id === value;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                          isSelected && "bg-muted/70 font-medium",
                        )}
                        onMouseDown={(e) => {
                          // Prevent input blur before click registers.
                          e.preventDefault();
                        }}
                        onClick={() => {
                          onChange(option.id);
                          setOpen(false);
                          setSearch("");
                        }}
                      >
                        <Check
                          className={cn(
                            "size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                          aria-hidden
                        />
                        <span className="line-clamp-2">{option.label}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
          !selected && "text-muted-foreground",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="line-clamp-1 text-left">
          {selected?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
      </button>
      {menu}
    </div>
  );
}

/** Flatten nested category API rows into searchable options (parent / child labels). */
export function flattenCategoryOptions(rows: unknown[]): CategorySearchOption[] {
  const options: CategorySearchOption[] = [];
  const seen = new Set<string>();

  const pushOption = (option: CategorySearchOption) => {
    if (seen.has(option.id)) return;
    seen.add(option.id);
    options.push(option);
  };

  for (const raw of rows) {
    if (!raw || typeof raw !== "object") continue;
    const parent = raw as Record<string, unknown>;
    const parentId = parent.id;
    const parentTitle = typeof parent.title === "string" ? parent.title : "";
    if (parentId == null || !parentTitle) continue;

    const parentIdStr = String(parentId);
    const isRoot = parent.parent_id == null || parent.parent_id === "";

    // Prefer root rows as plain titles; nested children get "Parent / Child".
    if (isRoot || !seen.has(parentIdStr)) {
      pushOption({
        id: parentIdStr,
        title: parentTitle,
        label: parentTitle,
        status: (parent.status as CategorySearchOption["status"]) ?? undefined,
      });
    }

    const children = Array.isArray(parent.children) ? parent.children : [];
    for (const childRaw of children) {
      if (!childRaw || typeof childRaw !== "object") continue;
      const child = childRaw as Record<string, unknown>;
      const childId = child.id;
      const childTitle = typeof child.title === "string" ? child.title : "";
      if (childId == null || !childTitle) continue;
      pushOption({
        id: String(childId),
        title: childTitle,
        label: `${parentTitle} / ${childTitle}`,
        status: (child.status as CategorySearchOption["status"]) ?? undefined,
      });
    }
  }

  return options;
}
