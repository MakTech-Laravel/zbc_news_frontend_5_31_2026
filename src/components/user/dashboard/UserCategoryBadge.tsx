import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, string> = {
  Technology: "bg-admin-badge-tech-bg text-admin-badge-tech-text",
  Business: "bg-admin-badge-politics-bg text-admin-badge-politics-text",
  World: "bg-admin-badge-tech-bg text-admin-badge-tech-text",
  Health: "bg-admin-badge-sports-bg text-admin-badge-sports-text",
  Politics: "bg-admin-badge-politics-bg text-admin-badge-politics-text",
  Sports: "bg-admin-badge-sports-bg text-admin-badge-sports-text",
};

type UserCategoryBadgeProps = {
  label: string;
  className?: string;
};

export function UserCategoryBadge({ label, className }: UserCategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded px-1.5 text-xs font-medium",
        CATEGORY_STYLES[label] ?? "bg-admin-badge-draft-bg text-admin-badge-draft-text",
        className,
      )}
    >
      <span className="text-xs font-inter font-medium">{label}</span>
    </span>
  );
}
