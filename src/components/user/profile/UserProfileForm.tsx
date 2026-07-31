import * as React from "react";
import { Bell, Globe, Link2, LogOut, Mail, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { ProfilePhotoField } from "@/components/user/profile/ProfilePhotoField";
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
import { canManagePublicAuthorProfile } from "@/auth/roles";
import { useAuth } from "@/auth/useAuth";
import { logoutAllDevices } from "@/features/auth/service";
import { uploadAdminMedia } from "@/services/admin/media";
import toast from "react-hot-toast";
import InputError from "@/components/input-error";
import { getAuthorPath } from "@/lib/authorPaths";

const optionalUrlField = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Enter a valid URL",
  });

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
    .or(z.literal("")),
  region: z.string().optional(),
  bio: z.string().max(1000, "Bio must be 1000 characters or less").optional(),
  publicTitle: z.string().max(255, "Title must be 255 characters or less").optional(),
  facebook: optionalUrlField.optional(),
  twitter: optionalUrlField.optional(),
  linkedin: optionalUrlField.optional(),
  instagram: optionalUrlField.optional(),
  youtube: optionalUrlField.optional(),
  website: optionalUrlField.optional(),
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
  const { user, logout } = useAuth();
  const showAuthorProfile = canManagePublicAuthorProfile(user);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      slug: "",
      region: "",
      bio: "",
      publicTitle: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      youtube: "",
      website: "",
    },
  });

  const profileSlug = watch("slug");

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await request.get("/admin/users/profile");
        const d = res.data.data;
        const social = d.user_information?.social_links ?? {};
        reset({
          name: d.name ?? "",
          email: d.email ?? "",
          slug: d.slug ?? "",
          region: d.user_information?.region ?? "",
          bio: d.user_information?.bio ?? "",
          publicTitle: d.user_information?.public_title ?? "",
          facebook: social.facebook ?? "",
          twitter: social.twitter ?? "",
          linkedin: social.linkedin ?? "",
          instagram: social.instagram ?? "",
          youtube: social.youtube ?? "",
          website: social.website ?? "",
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

      let imageUrl = profileImageUrl;

      if (profileImageFile) {
        const uploaded = await uploadAdminMedia(profileImageFile);

        if (!uploaded?.url) {
          toast.error("Failed to upload profile photo.");
          return;
        }

        imageUrl = resolveMediaUrl(uploaded.url);
        setProfileImageUrl(imageUrl);
        setProfileImageFile(null);
      }

      const payload: Record<string, string | undefined> = {
        name: data.name,
        email: data.email,
        region: data.region ?? "",
        bio: data.bio ?? "",
        profile_image: imageUrl ?? "",
      };

      if (showAuthorProfile) {
        payload.slug = data.slug?.trim() || undefined;
        payload.public_title = data.publicTitle ?? "";
        payload.facebook = data.facebook ?? "";
        payload.twitter = data.twitter ?? "";
        payload.linkedin = data.linkedin ?? "";
        payload.instagram = data.instagram ?? "";
        payload.youtube = data.youtube ?? "";
        payload.website = data.website ?? "";
      }

      const res = await request.put("/admin/users/profile/update", payload);

      const updated = res.data?.data;
      if (updated) {
        const social = updated.user_information?.social_links ?? {};
        reset({
          name: updated.name ?? data.name,
          email: updated.email ?? data.email,
          slug: updated.slug ?? data.slug ?? "",
          region: updated.user_information?.region ?? "",
          bio: updated.user_information?.bio ?? "",
          publicTitle: updated.user_information?.public_title ?? "",
          facebook: social.facebook ?? "",
          twitter: social.twitter ?? "",
          linkedin: social.linkedin ?? "",
          instagram: social.instagram ?? "",
          youtube: social.youtube ?? "",
          website: social.website ?? "",
        });

        const updatedImage = updated.user_information?.profile_image;
        if (typeof updatedImage === "string" && updatedImage.trim()) {
          setProfileImageUrl(resolveMediaUrl(updatedImage));
        }
      }

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
    if (showAuthorProfile) return;
    void loadPreferences();
  }, [loadPreferences, showAuthorProfile]);

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

  const handleLogoutAllDevices = async () => {
    const confirmed = window.confirm(
      "Sign out from all devices? You will need to sign in again on this device and every other device.",
    );
    if (!confirmed) return;

    setLoggingOutAll(true);
    try {
      await logoutAllDevices();
      toast.success("Signed out from all devices.");
      await logout();
    } catch {
      toast.error("Unable to sign out from all devices. Please try again.");
    } finally {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <UserDashboardCard>
        <div className={cn("w-full", !showAuthorProfile && "md:w-1/2")}>
          <SettingsCardHeader
            title={showAuthorProfile ? "Profile Information" : "Profile Information"}
            subtitle={
              showAuthorProfile
                ? "Update your account and public author details"
                : "Update your personal details"
            }
          />
          <div className="space-y-6 px-6 pb-6">
            <ProfilePhotoField
              value={profileImageUrl}
              onChange={setProfileImageUrl}
              onFileChange={setProfileImageFile}
              disabled={profileLoading || saving}
            />

            <div className="h-px bg-border" />

            {profileLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: showAuthorProfile ? 4 : 4 }).map((_, i) => (
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
              <form
                onSubmit={handleSubmit(onSubmit)}
                className={showAuthorProfile ? "space-y-8" : undefined}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <User className="size-4 text-admin-label" aria-hidden />
                      Full Name
                    </label>
                    <Input {...register("name")} className="h-9" />
                    {errors.name ? <InputError message={errors.name.message!} /> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <Mail className="size-4 text-admin-label" aria-hidden />
                      Email
                    </label>
                    <Input type="email" {...register("email")} className="h-9" />
                    {errors.email ? <InputError message={errors.email.message!} /> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                      <MapPin className="size-4 text-admin-label" aria-hidden />
                      Region
                    </label>
                    <Input {...register("region")} className="h-9" />
                    {errors.region ? <InputError message={errors.region.message!} /> : null}
                  </div>

                  {!showAuthorProfile ? (
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-admin-heading">Bio</label>
                      <textarea
                        {...register("bio")}
                        className="min-h-[100px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm text-admin-heading placeholder:text-admin-label/60"
                        placeholder="Tell us about yourself..."
                      />
                      {errors.bio ? <InputError message={errors.bio.message!} /> : null}
                    </div>
                  ) : null}
                </div>

                {showAuthorProfile ? (
                  <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-admin-heading">
                        Public Author Profile
                      </h3>
                      <p className="mt-1 text-sm text-admin-label">
                        These details appear on your public author page.
                        {profileSlug ? (
                          <>
                            {" "}
                            Preview:{" "}
                            <Link
                              to={getAuthorPath(profileSlug)}
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              {getAuthorPath(profileSlug)}
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                          <Link2 className="size-4 text-admin-label" aria-hidden />
                          Public Slug
                        </label>
                        <Input
                          {...register("slug")}
                          className="h-9"
                          placeholder="your-public-slug"
                        />
                        {errors.slug ? <InputError message={errors.slug.message!} /> : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-admin-heading">
                          Public Title / Designation
                        </label>
                        <Input
                          {...register("publicTitle")}
                          className="h-9"
                          placeholder="Senior Reporter"
                        />
                        {errors.publicTitle ? (
                          <InputError message={errors.publicTitle.message!} />
                        ) : null}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-admin-heading">
                          Biography
                        </label>
                        <textarea
                          {...register("bio")}
                          className="min-h-[120px] w-full rounded-lg border border-admin-input-border bg-card px-3 py-2 text-sm text-admin-heading placeholder:text-admin-label/60"
                          placeholder="Write a short public biography..."
                        />
                        {errors.bio ? <InputError message={errors.bio.message!} /> : null}
                      </div>

                      {(
                        [
                          ["facebook", "Facebook"],
                          ["twitter", "X (Twitter)"],
                          ["linkedin", "LinkedIn"],
                          ["instagram", "Instagram"],
                          ["youtube", "YouTube"],
                          ["website", "Website"],
                        ] as const
                      ).map(([field, label]) => (
                        <div key={field} className="space-y-2">
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-admin-heading">
                            <Globe className="size-4 text-admin-label" aria-hidden />
                            {label}
                          </label>
                          <Input
                            {...register(field)}
                            className="h-9"
                            placeholder={`https://${field === "website" ? "example.com" : field + ".com/username"}`}
                          />
                          {errors[field] ? (
                            <InputError message={errors[field]?.message ?? ""} />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className={cn("flex flex-wrap gap-2", showAuthorProfile ? undefined : "mt-6")}>
                  <Button
                    type="submit"
                    variant="default"
                    className="bg-zbc-gray-700 text-white"
                    disabled={saving || (!isDirty && !profileImageFile)}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving || (!isDirty && !profileImageFile)}
                    onClick={() => {
                      if (isDirty && !window.confirm("Discard unsaved profile changes?")) {
                        return;
                      }
                      reset();
                      setProfileImageFile(null);
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

      <UserDashboardCard>
        <SettingsCardHeader
          title="Security"
          subtitle="Manage active sessions across your devices"
          icon={<LogOut className="size-5" aria-hidden />}
        />
        <div className="space-y-3 px-6 pb-6">
          <p className="text-sm text-admin-label">
            If you shared a device or suspect unauthorized access, sign out everywhere
            and sign in again with your password.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={loggingOutAll}
            onClick={() => void handleLogoutAllDevices()}
          >
            {loggingOutAll ? "Signing out…" : "Log out of all devices"}
          </Button>
        </div>
      </UserDashboardCard>

      {!showAuthorProfile ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}