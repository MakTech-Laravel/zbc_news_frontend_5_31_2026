import * as React from "react";
import { Bell, Mail, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { MediaImageField } from "@/components/admin/media/MediaImageField";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";
import { UserSettingSwitch } from "@/components/user/profile/UserSettingSwitch";
import { UserStatusBadge } from "@/components/user/shared/UserStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/user/notificationPreferences";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_OPTIONS,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "@/types/notificationPreferences";
import { request } from "@/api/request";
import toast from "react-hot-toast";
import InputError from "@/components/input-error";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  region: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

type SettingsCardHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  compact?: boolean;
};

function SettingsCardHeader({
  title,
  subtitle,
  icon,
  compact,
}: SettingsCardHeaderProps) {
  return (
    <div className={cn("px-6", compact ? "pt-4 pb-1" : "pt-6 pb-2")}>
      {icon ? (
        <div className="flex items-center gap-2 text-admin-heading">
          <span className="text-admin-label">{icon}</span>
          <h2 className="text-base font-semibold leading-5">{title}</h2>
        </div>
      ) : (
        <h2 className="text-base font-semibold leading-5 text-admin-heading">
          {title}
        </h2>
      )}
      {subtitle ? (
        <p className="mt-1 text-base leading-6 text-admin-label">{subtitle}</p>
      ) : null}
    </div>
  );
}

type NotificationToggleProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function NotificationToggleRow({
  id,
  label,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-medium text-admin-heading">{label}</span>
      <UserSettingSwitch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-label={label}
      />
    </div>
  );
}

export function UserProfileForm() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", region: "", bio: "" },
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await request.get("/admin/users/profile");
        const d = res.data.data;
        console.log(d);
        reset({
          name: d.name ?? "",
          email: d.email ?? "",
          region: d.user_information?.region ?? "",
          bio: d.user_information?.bio ?? "",
        });
        if (d.user_information?.profile_image) {
          setProfileImageUrl(resolveMediaUrl(d.user_information.profile_image));
        }
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      setSaving(true);

      await request.put("/admin/users/profile/update", {
        name: data.name,
        email: data.email,
        region: data.region ?? "",
        bio: data.bio ?? "",
        profile_image: profileImageUrl ?? "",
      });

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Notification preferences
  const [notifications, setNotifications] =
    React.useState<NotificationPreferences | null>(null);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPreferences = React.useCallback(async () => {
    setNotifLoading(true);
    setNotifError(false);
    try {
      const data = await fetchNotificationPreferences();
      setNotifications(data);
    } catch {
      setNotifError(true);
      setNotifications(DEFAULT_NOTIFICATION_PREFERENCES);
      toast.error("Failed to load notification preferences.");
    } finally {
      setNotifLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  const handleToggle = (id: NotificationPreferenceKey, value: boolean) => {
    const updated = { ...(notifications ?? DEFAULT_NOTIFICATION_PREFERENCES), [id]: value };
    setNotifications(updated);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await updateNotificationPreferences(updated);
        toast.success("Preferences updated successfully.");
      } catch {
        toast.error("Failed to update preferences. Please try again.");
        void loadPreferences();
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <UserDashboardCard>
        <div className="w-full md:w-1/2">
          <SettingsCardHeader
            title="Profile Information"
            subtitle="Update your personal details"
          />
          <div className="space-y-6 px-6 pb-6">
            {/* Avatar */}
            <MediaImageField
              variant="avatar"
              value={profileImageUrl}
              onChange={setProfileImageUrl}
              uploadLabel="Select profile photo"
              previewAlt="Profile photo"
              urlPlaceholder="Or paste profile image URL"
            />

            <div className="h-px bg-border" />

            {/* Form */}
            {profileLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-9 animate-pulse rounded bg-muted",
                      i === 3 && "sm:col-span-2 h-24",
                    )}
                  />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <User className="size-4 text-admin-label" aria-hidden />
                      Full Name
                    </label>
                    <Input {...register("name")} className="h-9" />
                    {errors.name && (
                      <InputError message={errors.name.message!} />
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <Mail className="size-4 text-admin-label" aria-hidden />
                      Email
                    </label>
                    <Input
                      type="email"
                      {...register("email")}
                      className="h-9"
                    />
                    {errors.email && (
                      <InputError message={errors.email.message!} />
                    )}
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <MapPin className="size-4 text-admin-label" aria-hidden />
                      Region
                    </label>
                    <Input {...register("region")} className="h-9" />
                    {errors.region && (
                      <InputError message={errors.region.message!} />
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-admin-heading">
                      Bio
                    </label>
                    <textarea
                      {...register("bio")}
                      className="min-h-[100px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm text-admin-heading placeholder:text-admin-label/60"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && <InputError message={errors.bio.message!} />}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-zbc-gray-700 text-white"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setProfileImageUrl(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </UserDashboardCard>

      {/* Notification Preferences */}
      <UserDashboardCard>
        <div id="notification-preferences" className="scroll-mt-6" />
        <SettingsCardHeader
          title="Notification Preferences"
          subtitle="Manage how you receive updates"
          icon={<Bell className="size-5" aria-hidden />}
        />
        <div className="space-y-1 px-6 pb-6">
          {notifError ? (
            <div className="flex items-center justify-between gap-3 py-2">
              <p className="text-sm text-destructive">Could not load saved preferences.</p>
              <Button type="button" size="sm" variant="outline" onClick={() => void loadPreferences()}>
                Retry
              </Button>
            </div>
          ) : null}
          {notifLoading || !notifications
            ? Array.from({ length: NOTIFICATION_PREFERENCE_OPTIONS.length }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
                </div>
              ))
            : NOTIFICATION_PREFERENCE_OPTIONS.map((item) => (
                <NotificationToggleRow
                  key={item.id}
                  id={`notif-${item.id}`}
                  label={item.label}
                  checked={notifications[item.id]}
                  onChange={(v) => handleToggle(item.id, v)}
                />
              ))}
        </div>
      </UserDashboardCard>

      {/* Account Status */}
      <UserDashboardCard>
        <SettingsCardHeader title="Account Status" compact />
        <div className="space-y-3 px-6 pb-6">
          <Link
            to="/user/membership"
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/80 px-4 py-4 transition-colors hover:bg-muted"
          >
            <div>
              <p className="text-base font-semibold text-admin-heading">
                Membership Status
              </p>
              <p className="mt-1 text-sm text-admin-label">
                Premium account active
              </p>
            </div>
            <UserStatusBadge label="Premium" variant="account" />
          </Link>
          <div className="rounded-lg bg-muted/80 px-4 py-4">
            <p className="text-base font-semibold text-admin-heading">
              Member Since
            </p>
            <p className="mt-1 text-sm text-admin-label">January 2024</p>
          </div>
        </div>
      </UserDashboardCard>
    </div>
  );
}