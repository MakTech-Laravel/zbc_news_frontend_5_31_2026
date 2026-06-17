import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type LegalNavItem = {
  id: string;
  label: string;
};

type LegalDocumentLayoutProps = {
  navItems: LegalNavItem[];
  activeId: string;
  onNavClick?: (id: string) => void;
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
};

export function LegalDocumentLayout({
  navItems,
  activeId,
  onNavClick,
  sidebarFooter,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto container max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-zbc-nav-muted">Contents</p>
            <nav className="mt-4 space-y-1" aria-label="Page contents">
              {navItems.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavClick?.(item.id)}
                    className={cn(
                      "flex w-full items-center border-l-2 px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      isActive
                        ? "border-zbc-hero-navy bg-brand-soft text-zbc-hero-navy"
                        : "border-transparent text-admin-label hover:bg-zbc-gray-50",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
            {sidebarFooter}
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function LegalSidebarContact({
  question = "Questions?",
  linkLabel,
  linkTo,
  email,
}: {
  question?: string;
  linkLabel?: string;
  linkTo?: string;
  email?: string;
}) {
  return (
    <div className="mt-6 rounded-lg border border-zbc-blue-border bg-brand-soft p-4 text-xs leading-5 text-zbc-blue-accent">
      <p>{question}</p>
      {linkLabel && linkTo ? (
        <Link to={linkTo} className="mt-1 block text-base font-bold underline">
          {linkLabel}
        </Link>
      ) : null}
      {email ? (
        <p className="mt-1">
          at <span className="font-bold">{email}</span>
        </p>
      ) : null}
    </div>
  );
}

export function LegalSection({
  id,
  title,
  icon,
  children,
  className,
}: {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-32 pt-10 first:pt-0 md:pt-14", className)}>
      <div className="flex items-center gap-3 border-b border-zbc-gray-200 pb-4">
        {icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center bg-zbc-blue-light text-zbc-blue">
            {icon}
          </div>
        ) : null}
        <h2 className="text-2xl font-black leading-9 text-zbc-hero-navy md:text-3xl">{title}</h2>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export function LegalSummaryBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-zbc-hero-navy p-6 text-sm leading-[1.625rem] text-zbc-blue-light">
      <p className="text-sm font-bold uppercase tracking-[0.035em] text-zbc-blue-muted">{title}</p>
      <div className="pt-2">{children}</div>
    </div>
  );
}

export function LegalBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-5 text-admin-label">
          <span className="shrink-0 font-bold text-zbc-blue">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalCheckGrid({ items }: { items: string[] }) {
  return (
    <div className="">
      {items.map((item) => (
        <div key={item} className="flex gap-2 text-sm leading-5">
          <span className="shrink-0 font-bold text-primary-500">✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
