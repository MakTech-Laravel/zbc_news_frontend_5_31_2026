import * as React from "react";
import { BellRing, LayoutDashboard, Mail, RotateCcw, Save, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchAdminNotificationSettings,
  updateAdminNotificationSettings,
} from "@/services/admin/adminNotificationSettings";
import {
  ADMIN_NOTIFICATION_EVENTS,
  DEFAULT_ADMIN_NOTIFICATION_CHANNELS,
  DEFAULT_ADMIN_NOTIFICATION_EMAIL,
  type AdminNotificationChannels,
  type AdminNotificationEvent,
} from "@/types/adminNotificationSettings";

type Channel = "dashboard" | "email";

function ChannelSwitch({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "on" : "off"}`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue focus-visible:ring-offset-2",
          checked
            ? "border-zbc-blue bg-zbc-blue"
            : "border-zbc-gray-500 bg-zbc-gray-400",
        )}
      >
        <span
          className={cn(
            "pointer-events-none size-4 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5.5" : "translate-x-1",
          )}
        />
      </button>
      <span
        aria-hidden
        className={cn(
          "w-7 text-xs font-semibold uppercase tracking-wide",
          checked ? "text-zbc-blue" : "text-admin-label",
        )}
      >
        {checked ? "On" : "Off"}
      </span>
    </span>
  );
}

export function NotificationsSettingsTab() {
  const [settings, setSettings] = React.useState<AdminNotificationChannels>(
    DEFAULT_ADMIN_NOTIFICATION_CHANNELS,
  );
  const [savedSettings, setSavedSettings] = React.useState<AdminNotificationChannels>(
    DEFAULT_ADMIN_NOTIFICATION_CHANNELS,
  );
  const [notificationEmail, setNotificationEmail] = React.useState(
    DEFAULT_ADMIN_NOTIFICATION_EMAIL,
  );
  const [savedNotificationEmail, setSavedNotificationEmail] = React.useState(
    DEFAULT_ADMIN_NOTIFICATION_EMAIL,
  );
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    fetchAdminNotificationSettings()
      .then((data) => {
        if (cancelled) return;
        setSettings(data.settings);
        setSavedSettings(data.settings);
        setNotificationEmail(data.admin_notification_email);
        setSavedNotificationEmail(data.admin_notification_email);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load notification settings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dirty =
    JSON.stringify(settings) !== JSON.stringify(savedSettings) ||
    notificationEmail.trim().toLowerCase() !== savedNotificationEmail.trim().toLowerCase();
  const dashboardCount = ADMIN_NOTIFICATION_EVENTS.filter(
    (event) => settings[event.id].dashboard,
  ).length;
  const emailCount = ADMIN_NOTIFICATION_EVENTS.filter(
    (event) => settings[event.id].email,
  ).length;

  function setChannel(event: AdminNotificationEvent, channel: Channel, enabled: boolean) {
    setSettings((current) => ({
      ...current,
      [event]: {
        ...current[event],
        [channel]: enabled,
      },
    }));
  }

  function setAll(channel: Channel, enabled: boolean) {
    setSettings((current) => {
      const next = { ...current };
      for (const event of ADMIN_NOTIFICATION_EVENTS) {
        next[event.id] = { ...next[event.id], [channel]: enabled };
      }
      return next;
    });
  }

  function reset() {
    setSettings(savedSettings);
    setNotificationEmail(savedNotificationEmail);
  }

  async function save() {
    const email = notificationEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid primary admin notification email");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAdminNotificationSettings({
        settings,
        admin_notification_email: email,
      });
      setSettings(updated.settings);
      setSavedSettings(updated.settings);
      setNotificationEmail(updated.admin_notification_email);
      setSavedNotificationEmail(updated.admin_notification_email);
      toast.success("Notification settings saved");
    } catch {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zbc-blue/20 bg-zbc-blue/5 p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zbc-blue/10 text-zbc-blue">
            <ShieldCheck className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="font-semibold text-admin-heading">Staff notification channels</h2>
            <p className="mt-1 text-sm leading-6 text-admin-label">
              Administrative emails go to the primary inbox below and to Admin / Super Admin
              accounts. Dashboard notifications still apply to every staff role other than User.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <AdminFormField
          label="Primary admin notification email"
          htmlFor="admin-notification-email"
          hint="All administrative emails are sent to this address and to Admin / Super Admin accounts when Email is enabled for an event."
        >
          <input
            id="admin-notification-email"
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            placeholder={DEFAULT_ADMIN_NOTIFICATION_EMAIL}
            className={settingsInputClassName}
            autoComplete="email"
          />
        </AdminFormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-5 text-zbc-blue" aria-hidden />
              <div>
                <p className="font-medium text-admin-heading">Notification</p>
                <p className="text-xs text-admin-label">
                  {dashboardCount} of {ADMIN_NOTIFICATION_EVENTS.length} enabled
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAll("dashboard", dashboardCount !== ADMIN_NOTIFICATION_EVENTS.length)}
            >
              {dashboardCount === ADMIN_NOTIFICATION_EVENTS.length ? "Disable all" : "Enable all"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-zbc-blue" aria-hidden />
              <div>
                <p className="font-medium text-admin-heading">Email</p>
                <p className="text-xs text-admin-label">
                  {emailCount} of {ADMIN_NOTIFICATION_EVENTS.length} enabled
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAll("email", emailCount !== ADMIN_NOTIFICATION_EVENTS.length)}
            >
              {emailCount === ADMIN_NOTIFICATION_EVENTS.length ? "Disable all" : "Enable all"}
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[minmax(0,1fr)_130px_130px] items-center border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-admin-label sm:grid">
          <span>Notification type</span>
          <span className="text-center">Notification</span>
          <span className="text-center">Email</span>
        </div>

        {ADMIN_NOTIFICATION_EVENTS.map((event) => (
          <div
            key={event.id}
            className="grid gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_130px_130px] sm:items-center sm:px-5"
          >
            <div className="flex min-w-0 gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-admin-label">
                <BellRing className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-admin-heading">{event.label}</p>
                <p className="mt-0.5 text-sm leading-5 text-admin-label">{event.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-center">
              <span className="text-sm text-admin-label sm:hidden">Dashboard</span>
              <ChannelSwitch
                id={`${event.id}-dashboard`}
                label={`${event.label} dashboard notifications`}
                checked={settings[event.id].dashboard}
                onChange={(enabled) => setChannel(event.id, "dashboard", enabled)}
              />
            </div>

            <div className="flex items-center justify-between sm:justify-center">
              <span className="text-sm text-admin-label sm:hidden">Email</span>
              <ChannelSwitch
                id={`${event.id}-email`}
                label={`${event.label} email notifications`}
                checked={settings[event.id].email}
                onChange={(enabled) => setChannel(event.id, "email", enabled)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-admin-surface/95 py-3 backdrop-blur-sm sm:static sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:py-0">
        <p className="text-sm text-admin-label">
          {dirty ? "You have unsaved notification changes." : "All notification changes are saved."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || saving}
            onClick={reset}
            className="gap-2"
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
          <Button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void save()}
            className="gap-2 bg-zbc-blue hover:bg-zbc-blue/90"
          >
            <Save className="size-4" aria-hidden />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
