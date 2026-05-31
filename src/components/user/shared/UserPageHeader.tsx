import type { ReactNode } from "react";

type UserPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function UserPageHeader({ title, description, actions }: UserPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-inter text-2xl font-semibold leading-8 tracking-tight text-admin-heading sm:text-3xl sm:leading-9">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-admin-label sm:mt-2 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
