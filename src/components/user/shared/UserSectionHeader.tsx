import type { LucideIcon } from "lucide-react";

type UserSectionHeaderProps = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

export function UserSectionHeader({ title, description, Icon }: UserSectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
        <Icon className="size-6" aria-hidden />
      </span>
      <div>
        <h2 className="text-xl font-semibold leading-9 tracking-tight text-admin-heading">
          {title}
        </h2>
        <p className="mt-1 text-base leading-6 text-admin-label">{description}</p>
      </div>
    </div>
  );
}
