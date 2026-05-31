import { cn } from "@/lib/utils";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function pageButtonClass(active: boolean, disabled?: boolean) {
  return cn(
    "inline-flex h-[42px] min-w-[38px] items-center justify-center rounded-[10px] border border-admin-input-border px-3 text-base font-medium transition-colors",
    active && "border-zbc-blue bg-zbc-blue text-white",
    !active && !disabled && "text-foreground hover:bg-muted",
    disabled && "cursor-not-allowed opacity-50",
  );
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: AdminPaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-admin-label">
        Showing {start} to {end} of {totalItems} results
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className={pageButtonClass(false, !canPrev)}
        >
          Previous
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={pageButtonClass(p === page)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className={pageButtonClass(false, !canNext)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
