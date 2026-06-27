import { cn } from "@/lib/utils";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

type PaginationItem = number | "ellipsis";

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start: number;
  let end: number;

  if (currentPage <= 3) {
    start = 1;
    end = 3;
  } else if (currentPage >= totalPages - 2) {
    start = totalPages - 2;
    end = totalPages;
  } else {
    start = currentPage - 1;
    end = currentPage + 1;
  }

  const items: PaginationItem[] = [];

  if (start > 1) {
    items.push("ellipsis");
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    items.push(pageNumber);
  }

  if (end < totalPages) {
    items.push("ellipsis");
  }

  return items;
}

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
  const pages = buildPaginationItems(page, totalPages);

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

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-[42px] min-w-[38px] items-center justify-center px-1 text-base font-medium text-admin-label"
              aria-hidden
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={pageButtonClass(item === page)}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}

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
