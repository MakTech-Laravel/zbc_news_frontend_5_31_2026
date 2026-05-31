import { UserPageShell } from "@/components/user/UserPageShell";
import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserSettings() {
  return (
    <UserPageShell
      title="Settings"
      description="Notification and account preferences"
    >
      <UserDashboardCard>
        <UserDashboardCardHeader title="Account" />
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-admin-heading">Display name</label>
            <Input defaultValue="John Doe" className="h-9 max-w-md" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-admin-heading">Language</label>
            <Input defaultValue="English" className="h-9 max-w-md" />
          </div>
        </div>
      </UserDashboardCard>

      <UserDashboardCard>
        <UserDashboardCardHeader title="Privacy" />
        <div className="space-y-4 p-6">
          {["Show reading activity", "Allow topic recommendations"].map((label) => (
            <label key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-admin-heading">{label}</span>
              <input type="checkbox" defaultChecked className="size-4 rounded border-border" />
            </label>
          ))}
        </div>
      </UserDashboardCard>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </UserPageShell>
  );
}
