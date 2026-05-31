import type { ReactNode } from "react";

import { UserPageHeader } from "@/components/user/shared/UserPageHeader";

type UserPageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function UserPageShell({ title, description, actions, children }: UserPageShellProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <UserPageHeader title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}
