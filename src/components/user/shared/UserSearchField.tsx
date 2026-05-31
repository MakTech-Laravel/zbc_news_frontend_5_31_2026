import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UserSearchFieldProps = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function UserSearchField({
  placeholder,
  className,
  value,
  onChange,
}: UserSearchFieldProps) {
  return (
    <div className={cn("relative w-full max-w-3xl", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-label"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-9 rounded-lg pl-10 text-sm bg-zbc-gray-200/50 border-zbc-gray-200/50"
      />
    </div>
  );
}
