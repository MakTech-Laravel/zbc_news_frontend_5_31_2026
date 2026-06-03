import * as React from "react";
import { Bell, Globe, Mail, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/useAuth";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { UserSettingSwitch } from "@/components/user/profile/UserSettingSwitch";
import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type SettingsCardHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  compact?: boolean;
};

function SettingsCardHeader({ title, subtitle, icon, compact }: SettingsCardHeaderProps) {
  return (
    <div className={cn("px-6", compact ? "pt-4 pb-1" : "pt-6 pb-2")}>
      {icon ? (
        <div className="flex items-center gap-2 text-admin-heading">
          <span className="text-admin-label">{icon}</span>
          <h2 className="text-base font-semibold leading-5">{title}</h2>
        </div>
      ) : (
        <h2 className="text-base font-semibold leading-5 text-admin-heading">{title}</h2>
      )}
      {subtitle ? <p className="mt-1 text-base leading-6 text-admin-label">{subtitle}</p> : null}
    </div>
  );
}

type NotificationToggleProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function NotificationToggleRow({ id, label, checked, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium text-admin-heading">{label}</span>
      <UserSettingSwitch id={id} checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

const NOTIFICATION_OPTIONS = [
  { id: "breaking", label: "Breaking News Alerts", defaultOn: true },
  { id: "newsletter", label: "Daily Newsletter", defaultOn: true },
  { id: "recommendations", label: "Personalized Recommendations", defaultOn: true },
  { id: "comments", label: "Comment Replies", defaultOn: false },
  { id: "saved", label: "Saved Article Updates", defaultOn: false },
] as const;

function useToggleState<T extends readonly { id: string; defaultOn: boolean }[]>(options: T) {
  const [state, setState] = React.useState(() =>
    Object.fromEntries(options.map((o) => [o.id, o.defaultOn])) as Record<string, boolean>,
  );
  const set = (id: string, value: boolean) => setState((s) => ({ ...s, [id]: value }));
  return [state, set] as const;
}

export function UserProfileForm() {
  const { user } = useAuth();
  const displayName = user?.name ?? "John Doe";
  const email = user?.email ?? "john.doe@example.com";
  const initials = getInitials(displayName);

  const [notifications, setNotification] = useToggleState(NOTIFICATION_OPTIONS);

  return (
    <div className="space-y-6">
      <UserDashboardCard>
        <div className="w-full md:w-1/2">
          <SettingsCardHeader
            title="Profile Information"
            subtitle="Update your personal details"
          />
          <div className="space-y-6 px-6 pb-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex size-20 items-center justify-center rounded-full bg-zbc-gray-200 text-2xl font-semibold text-zbc-gray-900">
                {initials}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                  <User className="size-4 text-admin-label" aria-hidden />
                  Full Name
                </label>
                <Input defaultValue={displayName} className="h-9" />
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                  <Mail className="size-4 text-admin-label" aria-hidden />
                  Email
                </label>
                <Input type="email" defaultValue={email} className="h-9" />
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                  <Globe className="size-4 text-admin-label" aria-hidden />
                  Language
                </label>
                <Input defaultValue="English (US)" className="h-9" />
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                  <MapPin className="size-4 text-admin-label" aria-hidden />
                  Region
                </label>
                <Input defaultValue="United States" className="h-9" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-admin-heading">Bio</label>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm text-admin-heading placeholder:text-admin-label/60"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="default" className="bg-zbc-gray-700 text-white">Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </UserDashboardCard>

      {/* <UserDashboardCard>
        <SettingsCardHeader
          title="Appearance"
          subtitle="Customize how ZBC News looks"
        />
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-6">
          <div className="flex items-start gap-3">
            <Moon className="mt-0.5 size-5 text-admin-label" aria-hidden />
            <div>
              <p className="text-base font-medium text-admin-heading">Dark Mode</p>
              <p className="text-sm text-admin-label">Switch between light and dark themes</p>
            </div>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            {(
              [
                { id: "light" as const, label: "Light", Icon: Sun },
                { id: "dark" as const, label: "Dark", Icon: Moon },
                { id: "auto" as const, label: "Auto", Icon: null },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                  theme === id
                    ? "bg-card text-admin-heading shadow-sm"
                    : "text-admin-label hover:text-admin-heading",
                )}
              >
                {Icon ? <Icon className="size-4" aria-hidden /> : null}
                {label}
              </button>
            ))}
          </div>
        </div>
      </UserDashboardCard> */}

      {/* <UserDashboardCard>
        <SettingsCardHeader
          title="Topic Preferences"
          subtitle="Choose topics you're interested in"
        />
        <div className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
          <div className="space-y-3">
            {leftTopics.map((topic) => (
              <TopicToggleRow
                key={topic.id}
                id={`topic-${topic.id}`}
                label={topic.label}
                checked={topics[topic.id]}
                onChange={(v) => setTopic(topic.id, v)}
              />
            ))}
          </div>
          <div className="space-y-3">
            {rightTopics.map((topic) => (
              <TopicToggleRow
                key={topic.id}
                id={`topic-${topic.id}`}
                label={topic.label}
                checked={topics[topic.id]}
                onChange={(v) => setTopic(topic.id, v)}
              />
            ))}
          </div>
        </div>
      </UserDashboardCard> */}

      <UserDashboardCard>
        <div id="notification-preferences" className="scroll-mt-6" />
        <SettingsCardHeader
          title="Notification Preferences"
          subtitle="Manage how you receive updates"
          icon={<Bell className="size-5" aria-hidden />}
        />
        <div className="space-y-1 px-6 pb-6">
          {NOTIFICATION_OPTIONS.map((item) => (
            <NotificationToggleRow
              key={item.id}
              id={`notif-${item.id}`}
              label={item.label}
              checked={notifications[item.id]}
              onChange={(v) => setNotification(item.id, v)}
            />
          ))}
        </div>
      </UserDashboardCard>

      <UserDashboardCard>
        <SettingsCardHeader title="Account Status" compact />
        <div className="space-y-3 px-6 pb-6">
          <Link
            to="/user/membership"
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/80 px-4 py-4 transition-colors hover:bg-muted"
          >
            <div>
              <p className="text-base font-semibold text-admin-heading">Membership Status</p>
              <p className="mt-1 text-sm text-admin-label">Premium account active</p>
            </div>
            <UserStatusBadge label="Premium" variant="account" />
          </Link>
          <div className="rounded-lg bg-muted/80 px-4 py-4">
            <p className="text-base font-semibold text-admin-heading">Member Since</p>
            <p className="mt-1 text-sm text-admin-label">January 2024</p>
          </div>
        </div>
      </UserDashboardCard>
    </div>
  );
}
