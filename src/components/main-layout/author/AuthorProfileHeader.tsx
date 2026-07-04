import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { cn } from "@/lib/utils";
import type { PublicAuthor } from "@/types/author";

import { AuthorSocialLinks } from "./AuthorSocialLinks";

type AuthorProfileHeaderProps = {
  author: PublicAuthor;
  className?: string;
};

export function AuthorProfileHeader({ author, className }: AuthorProfileHeaderProps) {
  const hasBio = Boolean(author.bio?.trim());
  const hasPublicTitle = Boolean(author.publicTitle?.trim());
  const hasSocialLinks = Boolean(
    author.socialLinks &&
      Object.values(author.socialLinks).some((value) => value?.trim()),
  );

  return (
    <header
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="bg-linear-to-br from-primary/10 via-background to-background px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="relative shrink-0">
            <div className="size-28 overflow-hidden rounded-full border-4 border-background shadow-md ring-2 ring-primary/15 sm:size-32 lg:size-36">
              {author.profileImageUrl ? (
                <HeaderAvatar
                  src={author.profileImageUrl}
                  alt={`${author.name} profile photo`}
                  className="size-full"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-linear-to-br from-zbc-blue to-[#1447e6] font-inter text-2xl font-bold text-white sm:text-3xl">
                  {author.initials}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="font-inter text-3xl font-bold tracking-tight text-zbc-gray-1000 sm:text-4xl">
                {author.name}
              </h1>
              {hasPublicTitle ? (
                <p className="font-inter text-base font-semibold text-primary sm:text-lg">
                  {author.publicTitle}
                </p>
              ) : null}
            </div>

            {hasBio ? (
              <p className="mx-auto max-w-2xl font-inter text-base leading-7 text-zbc-gray-700 sm:mx-0">
                {author.bio}
              </p>
            ) : null}

            {hasSocialLinks && author.socialLinks ? (
              <AuthorSocialLinks
                links={author.socialLinks}
                className="justify-center sm:justify-start"
              />
            ) : null}

            <p className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 font-inter text-sm text-muted-foreground">
              <span className="mr-2 font-semibold text-zbc-gray-1000">
                {author.publishedArticlesCount}
              </span>
              {author.publishedArticlesCount === 1
                ? "Published Article"
                : "Published Articles"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AuthorProfileHeaderSkeleton() {
  return (
    <header className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-linear-to-br from-primary/10 via-background to-background px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex animate-pulse flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="size-28 shrink-0 rounded-full bg-muted sm:size-32 lg:size-36" />
          <div className="w-full max-w-xl space-y-4">
            <div className="mx-auto h-10 w-56 rounded bg-muted sm:mx-0" />
            <div className="mx-auto h-5 w-40 rounded bg-muted sm:mx-0" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="flex justify-center gap-2 sm:justify-start">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="size-10 rounded-full bg-muted" />
              ))}
            </div>
            <div className="mx-auto h-8 w-40 rounded-full bg-muted sm:mx-0" />
          </div>
        </div>
      </div>
    </header>
  );
}
