import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import { cn } from "@/lib/utils";

type UserDashboardWelcomeProps = {
  displayName: string;
};

export function UserDashboardWelcome({ displayName }: UserDashboardWelcomeProps) {
  const firstName = displayName.split(/\s+/)[0] ?? displayName;

  return (
    <div className={cn("rounded-xl border border-border bg-user-banner-welcome px-6 py-6 shadow-sm")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-9 tracking-tight text-admin-heading">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-base leading-6 text-admin-label">
            Here&apos;s what&apos;s happening in the world today
          </p>
        </div>
        <UserStatusBadge label="Premium" variant="premium" />
      </div>
    </div>
  );
}
