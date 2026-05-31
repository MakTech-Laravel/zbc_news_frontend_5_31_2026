import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

type SeoEditButtonProps = {
  to: string;
};

export function SeoEditButton({ to }: SeoEditButtonProps) {
  return (
    <Link
      to={to}
      className="inline-flex h-6 items-center gap-2 rounded border border-zbc-blue px-1 py-1 text-base text-zbc-blue transition-colors hover:bg-zbc-blue/5"
    >
      <Pencil className="size-4 shrink-0" aria-hidden />
      Edit
    </Link>
  );
}
