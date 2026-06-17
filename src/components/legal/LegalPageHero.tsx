import { Scale } from "lucide-react";
type LegalPageHeroProps = {
  title: string;
  meta: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showJumpSelect?: boolean;
  jumpOptions?: { id: string; label: string }[];
  onJump?: (id: string) => void;
};

export function LegalPageHero({
  title,
  meta,
  description,
  searchPlaceholder = "Search this policy…",
  onSearch,
  showSearch = false,
  showJumpSelect = false,
  jumpOptions = [],
  onJump,
}: LegalPageHeroProps) {
  return (
    <section className="bg-zbc-hero-navy py-20 md:py-24">
      <div className="mx-auto container max-w-4xl px-4">
        <div className="inline-flex items-center gap-2 bg-zbc-red-accent px-3 py-1.5">
          <Scale className="size-3 text-white" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-white">Legal</span>
        </div>
        <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-3 text-base leading-6 text-zbc-blue-border">{meta}</p>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-[1.625rem] text-zbc-blue-muted">{description}</p>
        ) : null}

        {showSearch ? (
          <form
            className="mt-6 flex max-w-md gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              onSearch?.(String(formData.get("q") ?? ""));
            }}
          >
            <input
              name="q"
              type="search"
              placeholder={searchPlaceholder}
              className="h-10 flex-1 bg-white px-9 text-sm text-zbc-gray-1000 placeholder:text-zbc-gray-500/80 focus-visible:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 bg-zbc-red-accent px-4 text-sm font-bold text-white"
            >
              Go
            </button>
          </form>
        ) : null}

        {showJumpSelect && jumpOptions.length > 0 ? (
          <div className="mt-6 max-w-sm">
            <select
              className="h-10 w-full appearance-none bg-white px-4 text-sm text-zbc-gray-500 focus-visible:outline-none"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) onJump?.(event.target.value);
              }}
            >
              <option value="" disabled>
                Jump to a section…
              </option>
              {jumpOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </section>
  );
}
