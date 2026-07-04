import { Link } from "react-router-dom";

import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { getAuthorPath, resolveAuthorSlug } from "@/lib/authorPaths";
import { cn } from "@/lib/utils";

type AuthorBylineProps = {
  name: string;
  initials: string;
  slug?: string | null;
  avatarUrl?: string | null;
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
};

export function AuthorByline({
  name,
  initials,
  slug,
  avatarUrl,
  className,
  avatarClassName,
  nameClassName,
}: AuthorBylineProps) {
  const authorSlug = resolveAuthorSlug(name, slug);
  const authorPath = getAuthorPath(authorSlug);
  const linkLabel = `View ${name}'s profile`;

  return (
    <Link
      to={authorPath}
      aria-label={linkLabel}
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 overflow-hidden rounded-full bg-primary ring-0 transition group-hover:ring-2 group-hover:ring-primary/30",
          avatarClassName,
        )}
      >
        {avatarUrl ? (
          <HeaderAvatar
            src={avatarUrl}
            alt={`${name} profile photo`}
            className="size-full"
          />
        ) : (
          <span className="flex size-full items-center justify-center font-inter text-sm font-bold text-primary-foreground">
            {initials}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-inter text-sm font-bold text-zbc-gray-1000 transition group-hover:text-primary",
            nameClassName,
          )}
        >
          {name}
        </span>
      </span>
    </Link>
  );
}
